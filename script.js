const ctx = document.getElementById("graficoGastos")

let salario = 0
let gastos = []

const inputSalario = document.getElementById("inputSalario")
const btnSalvarSalario = document.getElementById("btnSalvarSalario")

const btnAdicionarGasto = document.getElementById("btnAdicionarGasto")

const nomeGasto = document.getElementById("nomeGasto")
const valorGasto = document.getElementById("valorGasto")
const categoriaGasto = document.getElementById("categoriaGasto")

const listaGastos = document.getElementById("listaGastos")

const salarioTotal = document.getElementById("salarioTotal")
const gastoTotal = document.getElementById("gastoTotal")
const saldoRestante = document.getElementById("saldoRestante")

btnSalvarSalario.onclick = function(){

    let valorSalario = Number(inputSalario.value)

    if (inputSalario.value === "") {
        alert("Digite seu salário.")
        return
    }

    if (valorSalario <= 0) {
        alert("O salário deve ser maior que zero.")
        return
    }

    salario = valorSalario

    localStorage.setItem("salario", salario)

    atualizarResumo()

    inputSalario.value = ""

}

btnAdicionarGasto.onclick = function(){

    let nome = nomeGasto.value.trim()
    let valor = Number(valorGasto.value)
    let categoria = categoriaGasto.value

    if (nome === "") {
        alert("Digite o nome do gasto.")
        return
    }

    if (valorGasto.value === "") {
        alert("Digite o valor do gasto.")
        return
    }

    if (valor <= 0) {
        alert("O valor do gasto deve ser maior que zero.")
        return
    }

    let gasto = {
        id: Date.now(),
        nome: nome,
        valor: valor,
        categoria: categoria
    }

    gastos.push(gasto)

    localStorage.setItem("gastos", JSON.stringify(gastos))

    atualizarLista()
    atualizarResumo()
    atualizarGrafico()

    nomeGasto.value = ""
    valorGasto.value = ""
    categoriaGasto.value = "Alimentação"
    nomeGasto.focus()

}

function atualizarLista() {
    listaGastos.innerHTML = ""

    gastos.forEach(function(g) {
        let item = document.createElement("li")

        item.innerHTML = `
            <span>${g.nome} - ${g.categoria} - R$ ${g.valor.toFixed(2)}</span>
            <button onclick="removerGasto(${g.id})">❌</button>
        `

        listaGastos.appendChild(item)
    })
}

function atualizarResumo() {
    let totalGastos = 0

    gastos.forEach(function(g) {
        totalGastos += g.valor
    })

    let saldo = salario - totalGastos

    salarioTotal.innerText = `R$ ${salario.toFixed(2)}`
    gastoTotal.innerText = `R$ ${totalGastos.toFixed(2)}`
    saldoRestante.innerText = `R$ ${saldo.toFixed(2)}`
}

let grafico = new Chart(ctx, {

    type: "pie",

    data: {

        labels: ["Alimentação", "Transporte", "Estudos", "Lazer", "Outros"],

        datasets: [{

            data: [0,0,0,0,0],

            backgroundColor: [
                "#e74c3c",
                "#3498db",
                "#2ecc71",
                "#f1c40f",
                "#9b59b6"
            ]

        }]

    }

})

function calcularCategorias(){

    let categorias = {
        Alimentação:0,
        Transporte:0,
        Estudos:0,
        Lazer:0,
        Outros:0
    }

    gastos.forEach(function(g){

        categorias[g.categoria] += g.valor

    })

    return categorias

}

function atualizarGrafico(){

    let categorias = calcularCategorias()

    grafico.data.datasets[0].data = [

        categorias["Alimentação"],
        categorias["Transporte"],
        categorias["Estudos"],
        categorias["Lazer"],
        categorias["Outros"]

    ]

    grafico.update()

}

function carregarDados(){

    let salarioSalvo = localStorage.getItem("salario")
    let gastosSalvos = localStorage.getItem("gastos")

    if(salarioSalvo){
        salario = Number(salarioSalvo)
    }

    if(gastosSalvos){
        gastos = JSON.parse(gastosSalvos)
    }

    atualizarLista()
    atualizarResumo()
    atualizarGrafico()

}

carregarDados()

function removerGasto(id){

    gastos = gastos.filter(function(g){

        return g.id !== id

    })

    localStorage.setItem("gastos", JSON.stringify(gastos))

    atualizarLista()
    atualizarResumo()
    atualizarGrafico()

}

mensagemErro.innerText = "Digite um valor válido."