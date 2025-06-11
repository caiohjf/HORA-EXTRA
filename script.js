document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inscricaoForm');
    const maspInput = document.getElementById('masp');
    const dataSelectors = [
        document.getElementById('data1'),
        document.getElementById('data2'),
        document.getElementById('data3'),
        document.getElementById('data4')
    ];
    const mensagemSucesso = document.getElementById('mensagemSucesso');

    const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const regrasData = [
        { tipo: 'fimDeSemana', msg: 'Primeira data deve ser um sábado ou domingo.' },
        { tipo: 'facultativa', msg: 'Segunda data pode ser qualquer dia selecionável.' },
        { tipo: 'fimDeSemana', msg: 'Terceira data deve ser um sábado ou domingo.' },
        { tipo: 'facultativa', msg: 'Quarta data pode ser qualquer dia selecionável.' }
    ];

    /**
     * Gera e retorna um array com as datas válidas (terças, quintas, sábados, domingos)
     * do mês e ano atual.
     * @returns {Array<Object>} Um array de objetos, onde cada objeto tem { date: Date, formatted: string, isWeekend: boolean }.
     */
    function gerarDatasValidasDoMes() {
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth(); // 0 para janeiro, 11 para dezembro
        const datasValidas = [];

        // Para obter o último dia do mês, podemos ir para o próximo mês e subtrair um dia.
        const ultimoDiaDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

        for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
            const data = new Date(anoAtual, mesAtual, dia);
            const diaDaSemana = data.getDay(); // 0 para domingo, 6 para sábado

            // Verifica se é terça (2), quinta (4), sábado (6) ou domingo (0)
            if (diaDaSemana === 0 || diaDaSemana === 2 || diaDaSemana === 4 || diaDaSemana === 6) {
                const diaFormatado = String(dia).padStart(2, '0');
                const mesFormatado = String(mesAtual + 1).padStart(2, '0');
                const nomeDia = diasDaSemana[diaDaSemana];
                
                datasValidas.push({
                    date: data,
                    formatted: `${diaFormatado}/${mesFormatado}/${anoAtual} (${nomeDia})`,
                    isWeekend: (diaDaSemana === 0 || diaDaSemana === 6)
                });
            }
        }
        return datasValidas;
    }

    /**
     * Popula os elementos <select> com as datas válidas.
     */
    function popularSelectsDeData() {
        const datas = gerarDatasValidasDoMes();
        dataSelectors.forEach(selectElement => {
            // Limpa as opções existentes antes de popular
            selectElement.innerHTML = '<option value="" disabled selected>Selecione uma data</option>';
            datas.forEach(data => {
                const option = document.createElement('option');
                // O valor da opção será o timestamp da data para fácil validação
                option.value = data.date.getTime(); 
                option.textContent = data.formatted;
                // Adiciona um atributo customizado para saber se é fim de semana
                option.dataset.isWeekend = data.isWeekend; 
                selectElement.appendChild(option);
            });
        });
    }

    /**
     * Valida a regra de alternância das datas selecionadas.
     * @returns {boolean} True se todas as datas selecionadas seguem as regras, false caso contrário.
     */
    function validarRegrasDeAlternancia() {
        let isValid = true;
        let errorMessage = '';

        for (let i = 0; i < dataSelectors.length; i++) {
            const selectElement = dataSelectors[i];
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            
            // Se nenhuma opção foi selecionada, é inválido. A validação 'required' do HTML já ajudaria.
            if (!selectedOption || selectedOption.value === "") {
                errorMessage = `Por favor, selecione a ${i + 1}ª data.`;
                isValid = false;
                break;
            }

            const isWeekendSelected = selectedOption.dataset.isWeekend === 'true';
            const regraAtual = regrasData[i];

            if (regraAtual.tipo === 'fimDeSemana' && !isWeekendSelected) {
                errorMessage = `${regraAtual.msg} (Erro na ${i + 1}ª data)`;
                isValid = false;
                break;
            } else if (regraAtual.tipo === 'facultativa' && !selectedOption.value) {
                // Para facultativa, apenas verificamos se algo foi selecionado,
                // já que o tipo de dia (fim de semana/dia de semana) não importa.
                // Mas a validação de 'required' do HTML já cobriria isso.
                // Esta parte é mais para clareza da lógica, caso o 'required' fosse removido.
            }
        }

        if (!isValid) {
            mensagemSucesso.textContent = errorMessage;
            mensagemSucesso.style.color = 'red';
        } else {
            mensagemSucesso.textContent = ''; // Limpa a mensagem se estiver válido
        }
        return isValid;
    }

    // Inicializa os seletores de data ao carregar a página
    popularSelectsDeData();

    // Event Listener para validação do MASP
    maspInput.addEventListener('input', () => {
        // Remove qualquer caractere que não seja número
        maspInput.value = maspInput.value.replace(/[^0-9]/g, '');
    });

    // Event Listener para cada seletor de data para validar em tempo real (opcional, mas bom para UX)
    dataSelectors.forEach(selectElement => {
        selectElement.addEventListener('change', validarRegrasDeAlternancia);
    });

    // Event Listener para o envio do formulário
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        mensagemSucesso.textContent = ''; // Limpa mensagens anteriores

        // Validação básica se os campos estão preenchidos (required do HTML já ajuda)
        const nomeValido = form.elements['nome'].value.trim() !== '';
        const maspValido = maspInput.value.trim().length > 0; // Já validado para só números no 'input' event

        if (!nomeValido || !maspValido) {
            mensagemSucesso.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            mensagemSucesso.style.color = 'red';
            return;
        }

        // Valida as regras específicas das datas
        if (!validarRegrasDeAlternancia()) {
            // A função já exibe a mensagem de erro
            return;
        }

        // Se todas as validações passaram
        mensagemSucesso.textContent = 'Formulário enviado com sucesso! (Não há backend para processar os dados)';
        mensagemSucesso.style.color = 'green';
        
        // Opcional: Limpar o formulário após o envio
        // form.reset(); 
        // popularSelectsDeData(); // Repopula as datas se o form for resetado
    });
});
