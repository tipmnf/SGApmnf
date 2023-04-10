from django.shortcuts import render, redirect
from .forms import GerarSenhaForm
from .models import Atendimento, TipoAtendimento, Atendente
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from escpos.printer import Usb, Escpos
from datetime import date
from django.db import transaction
import schedule, time

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
    return render(request, 'proxima_senha.html', {'senha': senha_atual, 'tipo_atendente': atendente.tipo_atendimento.nome})

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
    atendimentos = Atendimento.objects.filter(Q(status_atendimento='em atendimento') | Q(status_atendimento='finalizado')).order_by('data_inicio')
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
    atendimentos = Atendimento.objects.filter(status_atendimento='fila')
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

    printer = Usb(0x4b8, 0xe03)
    senha = atendimento.tipo_atendimento.prefixo + str(atendimento.numero_senha).zfill(3)
    data = date.today()
    dataStr = data.strftime("Data: %d/%m/%Y\n")

    printer.set(align='center', width=1, height=1)
    printer.text("\b SENHA:"+"\b\n\n")
    # printer.ln(count=2)

    printer.set(align='center', width=6, height=8)
    printer.text(senha + "\n\n")
    # printer.ln(count=2)  

    # printer.image(img_source=PROJECT_ROOT+"/static/img/logo-min.jpg")
    printer.set(align='center', width=1, height=1)
    printer.text("\bPrefeitura Municipal de Nova Friburgo\b\n")
    printer.text(dataStr)

    printer.cut()

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

@login_required
def getUser(request):
    atendente = Atendente.objects.get(user=request.user)
    return JsonResponse(atendente.tipo_atendimento.nome, safe=False)

# def copia_banco():

#     atendimentos = Atendimento.objects.all()

    
#     for i in range(len(atendimentos)):
#         atendimento_copia = atendimentos[i]

#         # Copy the related objects
#         atendente_copia = Atendente.objects.using('remote_db').get(id=atendimento_copia.atendente.id)
            
#         try:
#             tipo_atendimento_copia = TipoAtendimento.objects.using('remote_db').get(id=atendimento_copia.tipo_atendimento.id)
#         except TipoAtendimento.DoesNotExist:
#             tipo_atendimento_copia = TipoAtendimento.objects.using('remote_db').create(
#                 nome=atendimento_copia.tipo_atendimento.nome,
#                 prefixo=atendimento_copia.tipo_atendimento.prefixo,
#                 descricao= atendente_copia.tipo_atendimento.descricao
#             )
        

#         # Create the new object and assign the related objects
#         copia = Atendimento.objects.using('remote_db').create(
#             nome_cliente = atendimento_copia.nome_cliente,
#             data_atendimento = atendimento_copia.data_atendimento,
#             data_inicio = atendimento_copia.data_inicio,
#             data_fim = atendimento_copia.data_fim,
#             status_atendimento = atendimento_copia.status_atendimento,
#             numero_senha = atendimento_copia.numero_senha,
#             atendente = atendente_copia,
#             tipo_atendimento = tipo_atendimento_copia,
#         )
#         copia.save()
    
    

# # Schedule the task to run every day at noon
# schedule.every().day.at("22:00").do(copia_banco)

# Run the scheduled tasks in the background
# while True:
#     schedule.run_pending()
#     time.sleep(1)