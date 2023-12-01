from django.shortcuts import render, redirect
from .forms import GerarSenhaForm
from .models import Atendimento, TipoAtendimento, Atendente
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from escpos.printer import Usb, Serial
from datetime import date, datetime
import win32printing, win32print
import os
# Create your views here.

@login_required
def gerar_senha(request):
    form = GerarSenhaForm()    
    if request.method == "POST":
        form = GerarSenhaForm(request.POST)
        if form.is_valid():
            atendimento = form.save(commit=False)
            atendimento.gerar_senha()
            atendimento.status_atendimento='fila'
            atendimento.save()
            form = GerarSenhaForm()
            context={'form': form, 'tipos_atendimento': TipoAtendimento.objects.all(), 'atendimento': atendimento}
            try:
                imprimeSenha(request, atendimento)
            except:
                return render(request, 'erro.html', context)
            return render(request, 'gerar_senha.html', context)        
    context={'form': form, 'tipos_atendimento': TipoAtendimento.objects.all()}

    
    return render(request, 'gerar_senha.html', context)

@login_required
def chamar_proxima_senha(request):
    atendente = Atendente.objects.get(user=request.user) 
    limpaChamados(request)       
    try:

        # primeiro momento para a cabine registro chamar preferindo a fila Alvará
        # if atendente.registrador == True:
        #     senha_atual = Atendimento.objects.filter(status_atendimento='registrar').order_by('data_atendimento').first()
        #     senha_atual.status_atendimento = 'registrando'
        #     senha_atual.data_inicio = datetime.now()                
        # # else para caso a cabine não for de registro, chamar da fila registrada
        # else:    
        senha_atual = Atendimento.objects.filter(status_atendimento='fila', tipo_atendimento = atendente.tipo_atendimento).order_by('data_atendimento').first()
            # if not senha_atual:
            #     if atendente.tipo_atendimento.nome == 'Alvará':
            #         senha_atual = Atendimento.objects.filter(status_atendimento='fila', tipo_atendimento__nome = 'Geral').order_by('data_atendimento').first()
            #     else:
            #         senha_atual = Atendimento.objects.filter(status_atendimento='fila', tipo_atendimento__nome='Alvará').order_by('data_atendimento').first()    

        senha_atual.emAtendimento()
        senha_atual.atendente = atendente    
        senha_atual.save()
    except:
        senha_atual=Atendimento.objects.filter(status_atendimento='em atendimento', atendente=atendente).order_by('data_atendimento').first()
    
    if not senha_atual:
        return render(request, 'proxima_senha.html', {'senha': senha_atual, 'atendente': atendente})

    return render(request, 'em-atendimento.html', {'senha': senha_atual, 'cabine': atendente.cabine})

@login_required
def chamar_proxima_senha_especifica(request, prefixo):
    atendente = Atendente.objects.get(user=request.user)    
    if request.method == 'POST':        
        atendente.cabine = request.POST.get('cabine')
        atendente.save()
    try:
        senha_atual = Atendimento.objects.filter(status_atendimento='fila', tipo_atendimento__prefixo=prefixo).order_by('data_atendimento').first()
        # if not senha_atual:
        #     senha_atual = Atendimento.objects.filter(status_atendimento='fila').order_by('data_atendimento').first()
        # else: print(senha_atual)
        senha_atual.status_atendimento = 'chamando'
        senha_atual.atendente = atendente    
        senha_atual.save()
    except:
        senha_atual=Atendimento.objects.filter(status_atendimento='chamando', atendente=atendente).order_by('data_atendimento').first()
    return render(request, 'proxima_senha.html', {'senha': senha_atual, 'cabine': atendente.cabine, 'prefixo': prefixo})

@login_required
def ocioso(request):
    atendente = Atendente.objects.get(user=request.user)    
    if request.method == 'POST':        
        atendente.cabine = request.POST.get('cabine')
        atendente.save()
    senha_atual=None
    return render(request, 'proxima_senha.html', {'senha': senha_atual, 'atendente': atendente})

@login_required
def ocioso_especifico(request, prefixo):
    atendente = Atendente.objects.get(user=request.user)    
    if request.method == 'POST':        
        atendente.cabine = request.POST.get('cabine')
        atendente.save()
    senha_atual=None
    return render(request, 'proxima_senha.html', {'senha': senha_atual, 'cabine': atendente.cabine, 'prefixo': prefixo})


@login_required
def senhas_chamadas(request):
    senhas = Atendimento.objects.filter(status_atendimento='em atendimento').order_by('-data_atendimento')[:10]
    context = {'senhas': senhas}
    return render(request, 'senhas_chamadas.html', context)

@login_required
def tabela_dados(request):
    # atendimentos = Atendimento.objects.filter(status_atendimento='chamando').order_by('data_atendimento').first()
    atendimentos = Atendimento.objects.filter((Q(status_atendimento='em atendimento') | Q(status_atendimento='finalizado')) & Q(data_atendimento__gte=date.today())).order_by('data_inicio')
    dados = [
        {
            'senha': f'{atendimento.tipo_atendimento.prefixo}'+str(atendimento.numero_senha).zfill(3),
            'cabine': atendimento.atendente.cabine,
            'cliente': atendimento.nome_cliente,
            'status': atendimento.status_atendimento
        }
        for atendimento in atendimentos
    ]
    return JsonResponse(dados[::-1][:12], safe=False)

@login_required
def tabela_dados_anteriores(request):
    # atendimentos = Atendimento.objects.filter(status_atendimento='chamando').order_by('data_atendimento').first()
    atendimentos = Atendimento.objects.all()
    dados = [
        {
            'senha': f'{atendimento.tipo_atendimento.prefixo}'+str(atendimento.numero_senha).zfill(3),
            'cabine': atendimento.atendente.cabine,
            'cliente': atendimento.nome_cliente,
            'status': atendimento.status_atendimento,
            'tipo': atendimento.tipo_atendimento.nome
        }
        for atendimento in atendimentos if atendimento.status_atendimento == 'finalizado'
    ]
    return JsonResponse(dados[::-1], safe=False)


@login_required
def tabela_dados_fila(request):
    # atendimentos = Atendimento.objects.filter(status_atendimento='chamando').order_by('data_atendimento').first()
    atendimentos = Atendimento.objects.filter(Q(status_atendimento='fila') | Q(status_atendimento='registrar'))
    atendente = Atendente.objects.get(user=request.user)
    atendimentos = sorted(atendimentos, key=lambda atendimento: (atendimento.tipo_atendimento.nome == atendente.tipo_atendimento.nome, -atendimento.numero_senha))  

    dados = [
        {
            'senha': f'{atendimento.tipo_atendimento.prefixo}'+str(atendimento.numero_senha).zfill(3),            
            'cliente': atendimento.nome_cliente,
            'status': atendimento.status_atendimento,
            'tipo': atendimento.tipo_atendimento.nome
        }
        for atendimento in atendimentos 
    ]
    
    return JsonResponse(dados[::-1], safe=False)

@login_required
def conta_fila(request):
    
    atendimentos_contados = [0,0,0]
    atendimentos_contados[0] = Atendimento.objects.filter(Q(status_atendimento='fila') & Q(tipo_atendimento__nome='Geral')).count()
    atendimentos_contados[1] = Atendimento.objects.filter(Q(status_atendimento='fila') & Q(tipo_atendimento__nome='Alvará')).count()
    atendimentos_contados[2] = Atendimento.objects.filter(Q(status_atendimento='fila') & Q(tipo_atendimento__nome='Bloqueio')).count()
    
    print(atendimentos_contados)
    
    return JsonResponse(atendimentos_contados, safe=False)

@login_required
def tabela_dados_fila_especifica(request, prefixo):
    # atendimentos = Atendimento.objects.filter(status_atendimento='chamando').order_by('data_atendimento').first()
    atendimentos = Atendimento.objects.all()
    dados = [
        {
            'senha': f'{atendimento.tipo_atendimento.prefixo}'+str(atendimento.numero_senha).zfill(3),            
            'cliente': atendimento.nome_cliente,
            'status': atendimento.status_atendimento
        }
        for atendimento in atendimentos if atendimento.status_atendimento == 'fila' and atendimento.tipo_atendimento.prefixo == prefixo
    ]
    return JsonResponse(dados, safe=False)

@login_required
def emAtendimento(request, id):
    try:
        atendimento = Atendimento.objects.get(id=id)
        atendimento.emAtendimento()
        context={
        'senha': atendimento,
        }        
    except:
        context={
        'senha': '',
        }
    return render(request, 'em-atendimento.html', context)

@login_required
def emAtendimentoEspecifico(request, id, prefixo):
    try:
        atendimento = Atendimento.objects.get(id=id)
        atendimento.emAtendimento()
        context={
        'senha': atendimento,
        'prefixo': prefixo
        }        
    except:
        context={
        'senha': '',
        'prefixo': prefixo
        }
    return render(request, 'em-atendimento.html', context)

@login_required
def finalizarAtendimento(request, id):
    try:
        atendente = Atendente.objects.get(user=request.user)
        atendimento = Atendimento.objects.get(id=id)
        if atendente.registrador == True:
            print("cheguei")
            atendimento.status_atendimento = 'fila'
            atendimento.save()
        else:
            print("passei direto")
            atendimento.finalizar()
    except:
        print("nunca nem vi")
        pass
    return redirect('atendente')

@login_required
def finalizarAtendimentoEspecifico(request, id, prefixo):
    try:
        atendente = Atendente.objects.get(user=request.user)
        atendimento = Atendimento.objects.get(id=id)
        if atendente.registrador == True:
            atendimento.status_atendimento = 'fila'
        else:
            atendimento.finalizar()
    except:
        pass
    return redirect('atendente_especifico', prefixo)

@login_required
def proximo(request):
    return redirect('chamar_proxima_senha')

@login_required
def finalizarSemAtendimento(request):
    return redirect('chamar_proxima_senha')

def voltaDoErro(request):
    return redirect('gerar-senha')

from senhaFacil.settings import BASE_DIR, PROJECT_ROOT
@login_required
def imprimeSenha(request, atendimento):

    printer_name = "Diebold Procomp IM4X3TP_A"
    senha = atendimento.tipo_atendimento.prefixo + str(atendimento.numero_senha).zfill(3)
    data = date.today()
    dataStr = data.strftime("Data: %d/%m/%Y\n")

    font={
        "height": 10,
        "width": 5
    }

    fontSenha = {
        "height": 70,
        "width": 30
    }

    with win32printing.Printer(linegap=1) as printer:
        win32printing.Position(-100, -100)
        printer.text("Senha:", align="center", font_config=font)
        printer.text(senha, align="center", font_config=fontSenha)
        printer.text("Prefeitura Municipal de Nova Friburgo", align="center", font_config=font)
        printer.text(dataStr, align="center", font_config=font)
 
       
    # printer_cut = win32print.OpenPrinter(printer_name)
    
    # try:
    #     job = win32print.StartDocPrinter(printer_cut, 1, ('Test print', None, "RAW"))
    #     try:
    #         win32print.WritePrinter(printer_cut, "\n\n\n".encode('utf-8'))
    #         win32print.WritePrinter(printer_cut, "\x1Bm".encode('utf-8'))
    #     finally:
    #         win32print.EndPagePrinter(printer_cut)
    #         win32print.EndDocPrinter(printer_cut)
    # finally:
    #     win32print.ClosePrinter(printer_cut)


@login_required
def getSenhaAtual(request):
    senhasChamando = Atendimento.objects.filter(status_atendimento='em atendimento').order_by('-data_atendimento')
    senhasChamandoReg = Atendimento.objects.filter(status_atendimento='registrando').order_by('-data_atendimento')
    temChamando = len(senhasChamando) + len(senhasChamandoReg)

    return JsonResponse(temChamando, safe=False)

@login_required
def limpaChamados(request):
    atendente = Atendente.objects.get(user=request.user) 
    senhasChamando = Atendimento.objects.filter(status_atendimento='em atendimento', atendente=atendente ).order_by('data_atendimento')

    for x in range (len(senhasChamando)):
        senhasChamando[x].finalizar()

def getUser(request):
    atendente = Atendente.objects.get(user=request.user)
    dados = {'tipo': atendente.tipo_atendimento.nome, 'registrador': atendente.registrador}
    return JsonResponse(data=dados, safe=False)



    