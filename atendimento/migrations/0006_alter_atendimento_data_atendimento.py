# Generated by Django 4.1.4 on 2023-03-10 18:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('atendimento', '0005_alter_atendimento_nome_cliente'),
    ]

    operations = [
        migrations.AlterField(
            model_name='atendimento',
            name='data_atendimento',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
