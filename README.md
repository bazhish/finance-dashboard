# Ritmo Financeiro Pro

Projeto full stack com frontend em HTML/CSS/JS e backend em Python usando FastAPI + SQLite.

## O que foi feito

A base visual da `nova estrutura` foi mantida como linguagem principal, mas o projeto deixou de ser um template estático e passou a ter:

- dashboard com salário base, entradas, saídas e saldo;
- cadastro de lançamentos;
- categorias expansíveis;
- seleção do tipo de gráfico;
- módulo de cartão de crédito com:
  - fatura do mês,
  - limite disponível,
  - cadastro de cartões,
  - compras parceladas com geração automática das parcelas;
- página de metas diárias ligada ao backend;
- banco de dados SQLite persistente.

## Estrutura

- `main.py`: API + servidor estático.
- `data/finance.db`: banco SQLite criado automaticamente.
- `public/`: frontend.

## Como rodar

Crie um ambiente virtual e instale as dependências:

```bash
pip install -r requirements.txt
```

Depois rode:

```bash
uvicorn main:app --reload
```

Abra no navegador:

```bash
http://127.0.0.1:8000
```

## Rotas principais da API

- `GET /api/bootstrap?month=2026-03`
- `GET /api/goals?month=2026-03`
- `POST /api/settings`
- `POST /api/categories`
- `POST /api/transactions`
- `POST /api/cards`
- `POST /api/cards/{id}/installments`
- `DELETE /api/transactions/{id}`

## Próximo passo realmente profissional

O que está entregue aqui já é uma base séria. O próximo nível seria:

- autenticação por usuário;
- multiusuário com isolamento de dados;
- PostgreSQL no lugar de SQLite;
- testes automatizados;
- logs e observabilidade;
- deploy com Docker e variáveis de ambiente.
