from django.shortcuts import render, redirect
from .forms import GerarSenhaForm
from .models import Atendimento, TipoAtendimento, Atendente
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from escpos.printer import Usb, Serial
import serial
from datetime import date
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
            # try:
            imprimeSenha(request, atendimento)
            # except:
            #     return render(request, 'erro.html', context)
            return render(request, 'gerar_senha.html', context)        
    context={'form': form, 'tipos_atendimento': TipoAtendimento.objects.all()}

    
    return render(request, 'gerar_senha.html', context)

@login_required
def chamar_proxima_senha(request):
    atendente = Atendente.objects.get(user=request.user) 
    limpaChamados(request)       
    try:
        senha_atual = Atendimento.objects.filter(status_atendimento='fila', tipo_atendimento = atendente.tipo_atendimento).order_by('data_atendimento').first()
        if not senha_atual:
            if atendente.tipo_atendimento.nome == 'Preferencial':
                senha_atual = Atendimento.objects.filter(status_atendimento='fila', tipo_atendimento__nome = 'Geral').order_by('data_atendimento').first()
            elif not atendente.tipo_atendimento.nome == "Processos":
                senha_atual = Atendimento.objects.filter(status_atendimento='fila', tipo_atendimento__nome='Preferencial').order_by('data_atendimento').first()    
        else: print(senha_atual)
        senha_atual.emAtendimento()
        senha_atual.atendente = atendente    
        senha_atual.save()
    except:
        senha_atual=Atendimento.objects.filter(status_atendimento='em atendimento', atendente=atendente).order_by('data_atendimento').first()
    
    if not senha_atual:
        return render(request, 'proxima_senha.html', {'senha': senha_atual})

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
    return render(request, 'proxima_senha.html', {'senha': senha_atual, 'cabine': atendente.cabine})

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
    atendimentos = Atendimento.objects.all()
    dados = [
        {
            'senha': f'{atendimento.tipo_atendimento.prefixo}'+str(atendimento.numero_senha).zfill(3),
            'cabine': atendimento.atendente.cabine,
            'cliente': atendimento.nome_cliente,
            'status': atendimento.status_atendimento
        }
        for atendimento in atendimentos if atendimento.status_atendimento == 'em atendimento' or atendimento.status_atendimento == 'finalizado'
    ]
    return JsonResponse(dados[::-1][:12], safe=False)

# @login_required
# def tabela_dados_anteriores(request):
#     # atendimentos = Atendimento.objects.filter(status_atendimento='chamando').order_by('data_atendimento').first()
#     atendimentos = Atendimento.objects.all()
#     dados = [
#         {
#             'senha': f'{atendimento.tipo_atendimento.prefixo}'+str(atendimento.numero_senha).zfill(3),
#             'cabine': atendimento.atendente.cabine,
#             'cliente': atendimento.nome_cliente,
#             'status': atendimento.status_atendimento
#         }
#         for atendimento in atendimentos if atendimento.status_atendimento == 'finalizado'
#     ]
#     return JsonResponse(dados[::-1][:3], safe=False)

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
    atendimentos = Atendimento.objects.all()
    atendente = Atendente.objects.get(user=request.user)
    atendimentos = sorted(atendimentos, key=lambda atendimento: (atendimento.tipo_atendimento.nome == atendente.tipo_atendimento.nome, -atendimento.numero_senha))  

    dados = [
        {
            'senha': f'{atendimento.tipo_atendimento.prefixo}'+str(atendimento.numero_senha).zfill(3),            
            'cliente': atendimento.nome_cliente,
            'status': atendimento.status_atendimento,
            'tipo': atendimento.tipo_atendimento.nome
        }
        for atendimento in atendimentos if atendimento.status_atendimento == 'fila'
    ]
    
    return JsonResponse(dados[::-1], safe=False)

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
        atendimento = Atendimento.objects.get(id=id)
        atendimento.finalizar()
    except:
        pass
    return redirect('atendente')

@login_required
def finalizarAtendimentoEspecifico(request, id, prefixo):
    try:
        atendimento = Atendimento.objects.get(id=id)
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

    printer = serial.Serial('LPT1', 9600)
    senha = atendimento.tipo_atendimento.prefixo + str(atendimento.numero_senha).zfill(3)
    data = date.today()
    dataStr = data.strftime("Data: %d/%m/%Y\n").encode('utf-8')

    if not printer.is_open:
        printer.open()

    printer.write("\b SENHA:\n\n".encode('utf-8'))

    printer.write("\x1b\x21\x11".encode('utf-8'))
    printer.write((senha + "\n\n").encode('utf-8'))

    printer.write("\bPrefeitura Municipal de Nova Friburgo\b\n".encode('utf-8'))
    printer.write(dataStr)

    printer.write("\n\n\n\n\n".encode('utf-8'))

    printer.close()




@login_required
def getSenhaAtual(request):
    senhasChamando = Atendimento.objects.filter(status_atendimento='em atendimento').order_by('-data_atendimento')
    temChamando = len(senhasChamando)

    return JsonResponse(temChamando, safe=False)

@login_required
def limpaChamados(request):
    atendente = Atendente.objects.get(user=request.user) 
    senhasChamando = Atendimento.objects.filter(status_atendimento='em atendimento', atendente=atendente ).order_by('data_atendimento')

    for x in range (len(senhasChamando)):
        senhasChamando[x].finalizar()



    