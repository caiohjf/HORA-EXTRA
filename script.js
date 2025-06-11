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
    
    // Novas regras, mais específicas para cada campo
    const regrasCampoData = [
        { index: 0, tipo: 'fimDeSemana', obrigatorio: true, msgErro: 'Primeira data deve ser um sábado ou domingo.' },
        { index: 1, tipo: 'facultativa', obrigatorio: false, msgErro: '' }, // Facultativa pode ser qualquer dia válido
        { index: 2, tipo: 'fimDeSemana', obrigatorio: false, msgErro: 'Terceira data deve ser um sábado ou domingo.' },
        { index: 3, tipo: 'facultativa', obrigatorio: false, msgErro: '' }
    ];

    /**
     * Gera e retorna um array com as datas válidas (terças, quintas, sábados, domingos)
     * do mês e ano atual, com opção de filtrar por tipo de dia.
     * @param {string} filterType - 'todos' | 'fimDeSemana'.
     * @returns {Array<Object>} Um array de objetos, onde cada objeto tem { date: Date, formatted: string, isWeekend: boolean }.
     */
    function gerarDatasValidasDoMes(filterType = 'todos') {
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth();
        const datasValidas = [];

        const ultimoDiaDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

        for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
            const data = new Date(anoAtual, mesAtual, dia);
            const diaDaSemana = data.getDay(); // 0 para domingo, 6 para sábado

            const isWeekend = (diaDaSemana === 0 || diaDaSemana === 6);
            const isWeekdaySpecial = (diaDaSemana === 2 || diaDaSemana === 4); // Terça ou Quinta

            // Adiciona a data se ela atender aos critérios gerais (terça, quinta, sábado, domingo)
            // E se atender ao filtro específico ('fimDeSemana' ou 'todos')
            if ((isWeekend || isWeekdaySpecial)) {
                if (filterType === 'fimDeSemana' && !isWeekend) {
                    continue; // Pula se o filtro é fim de semana e não é fim de semana
                }
                
                const diaFormatado = String(dia).padStart(2, '0');
                const mesFormatado = String(mesAtual + 1).padStart(2, '0');
                const nomeDia = diasDaSemana[diaDaSemana];
                
                datasValidas.push({
                    date: data,
                    formatted: `${diaFormatado}/${mesFormatado}/${anoAtual} (${nomeDia})`,
                    isWeekend: isWeekend
                });
            }
        }
        return datasValidas;
    }

    /**
     * Popula um elemento <select> com as datas válidas baseadas no tipo de campo.
     * @param {HTMLElement} selectElement - O elemento <select> a ser populado.
     * @param {number} fieldIndex - O índice do campo de data (0 a 3).
     */
    function popularSelectDeData(selectElement, fieldIndex) {
        const regra = regrasCampoData[fieldIndex];
        const datas = gerarDatasValidasDoMes(regra.tipo === 'fimDeSemana' ? 'fimDeSemana' : 'todos');
        
        selectElement.innerHTML = `<option value="" ${regra.obrigatorio ? 'disabled' : ''} selected>Selecione uma data</option>`;
        
        // Se o campo for obrigatório, a primeira opção é disabled e selected
        if (regra.obrigatorio) {
            selectElement.innerHTML = '<option value="" disabled selected>Selecione uma data</option>';
        } else {
            // Se não for obrigatório, pode ter uma opção vazia que não é selecionada por padrão
            selectElement.innerHTML = '<option value="">Não selecionar</option>';
            // E a opção "Selecione uma data" também, mas não selecionada por padrão
            selectElement.innerHTML += '<option value="" disabled selected>Selecione uma data</option>';
        }


        datas.forEach(data => {
            const option = document.createElement('option');
            option.value = data.date.getTime(); 
            option.textContent = data.formatted;
            option.dataset.isWeekend = data.isWeekend; 
            selectElement.appendChild(option);
        });
    }

    /**
     * Habilita ou desabilita um campo <select> de data e o popula, se necessário.
     * @param {number} fieldIndex - O índice do campo de data (0 a 3).
     * @param {boolean} enable - True para habilitar, false para desabilitar.
     */
    function toggleDataField(fieldIndex, enable) {
        const selectElement = dataSelectors[fieldIndex];
        selectElement.disabled = !enable;
        if (enable && selectElement.options.length <= 1) { // Só popula se estiver vazio ou com a opção padrão
            popularSelectDeData(selectElement, fieldIndex);
        }
        // Se desabilitar, reseta a seleção
        if (!enable) {
            selectElement.value = "";
        }
    }

    /**
     * Valida a regra específica para um campo de data e exibe mensagens de erro.
     * @param {HTMLElement} selectElement - O elemento <select> a ser validado.
     * @param {number} fieldIndex - O índice do campo de data (0 a 3).
     * @returns {boolean} True se a validação passar, false caso contrário.
     */
    function validarCampoData(selectElement, fieldIndex) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const regra = regrasCampoData[fieldIndex];

        // Se o campo for obrigatório e nada foi selecionado
        if (regra.obrigatorio && (!selectedOption || selectedOption.value === "")) {
            mensagemSucesso.textContent = `Por favor, selecione a ${fieldIndex + 1}ª data.`;
            mensagemSucesso.style.color = 'red';
            return false;
        }

        // Se o campo não for obrigatório e não foi selecionado, está ok
        if (!regra.obrigatorio && (!selectedOption || selectedOption.value === "")) {
            return true;
        }

        const isWeekendSelected = selectedOption.dataset.isWeekend === 'true';

        // Valida a regra específica (fim de semana)
        if (regra.tipo === 'fimDeSemana' && !isWeekendSelected) {
            mensagemSucesso.textContent = `${regra.msgErro}`;
            mensagemSucesso.style.color = 'red';
            return false;
        }
        
        mensagemSucesso.textContent = ''; // Limpa a mensagem se válido
        return true;
    }

    // --- Inicialização e Event Listeners ---

    // Inicializa o primeiro seletor de data e desabilita os outros
    toggleDataField(0, true); // Habilita e popula o campo 1
    for (let i = 1; i < dataSelectors.length; i++) {
        toggleDataField(i, false); // Desabilita os campos 2, 3 e 4
    }

    // Event Listener para validação do MASP
    maspInput.addEventListener('input', () => {
        maspInput.value = maspInput.value.replace(/[^0-9]/g, '');
    });

    // Event Listeners para os seletores de data
    dataSelectors.forEach((selectElement, index) => {
        selectElement.addEventListener('change', () => {
            mensagemSucesso.textContent = ''; // Limpa mensagens anteriores
            if (!validarCampoData(selectElement, index)) {
                // Se a validação do campo atual falhou, não habilita o próximo
                if (index < dataSelectors.length -1) {
                    toggleDataField(index + 1, false); // Desabilita o próximo
                    // Desabilita e reseta todos os campos subsequentes
                    for (let i = index + 2; i < dataSelectors.length; i++) {
                        toggleDataField(i, false);
                    }
                }
                return;
            }

            // Se o campo atual foi preenchido e validado, habilita o próximo
            if (index < dataSelectors.length - 1) {
                toggleDataField(index + 1, true);
            }
            
            // Se um campo anterior foi alterado, e os campos subsequentes já estavam preenchidos,
            // revalida eles para garantir que a sequência continua correta.
            for (let i = index + 1; i < dataSelectors.length; i++) {
                if (dataSelectors[i].value !== "") { // Se o campo subsequente tem um valor
                    if (!validarCampoData(dataSelectors[i], i)) {
                        // Se a validação falhar, desabilita e reseta os campos a partir daqui
                        for (let j = i + 1; j < dataSelectors.length; j++) {
                            toggleDataField(j, false);
                        }
                        break; // Para de revalidar a sequência
                    }
                } else if (dataSelectors[i].disabled) {
                    // Se o campo subsequente está desabilitado, não precisamos ir além
                    break;
                }
            }
        });
    });

    // Event Listener para o envio do formulário
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        mensagemSucesso.textContent = ''; // Limpa mensagens anteriores

        // Validação básica de campos obrigatórios
        const nomeValido = form.elements['nome'].value.trim() !== '';
        const maspValido = maspInput.value.trim().length > 0;

        if (!nomeValido || !maspValido) {
            mensagemSucesso.textContent = 'Por favor, preencha o nome e o Masp.';
            mensagemSucesso.style.color = 'red';
            return;
        }

        let todasDatasValidas = true;
        // Valida cada campo de data, respeitando a obrigatoriedade
        for (let i = 0; i < dataSelectors.length; i++) {
            const selectElement = dataSelectors[i];
            const regra = regrasCampoData[i];

            // Se o campo está desabilitado, significa que o anterior não foi preenchido corretamente,
            // ou que este campo e os seguintes são opcionais e não foram selecionados.
            // A validação `validarCampoData` já lida com a obrigatoriedade.
            if (selectElement.disabled && regra.obrigatorio) {
                mensagemSucesso.textContent = `Por favor, preencha a ${i + 1}ª data.`;
                mensagemSucesso.style.color = 'red';
                todasDatasValidas = false;
                break;
            }
            
            // Se o campo está habilitado, mesmo que opcional, valide sua seleção
            if (!selectElement.disabled && !validarCampoData(selectElement, i)) {
                todasDatasValidas = false;
                break;
            }
        }

        if (!todasDatasValidas) {
            return; // A mensagem de erro já foi exibida por validarCampoData
        }

        // Se todas as validações passaram
        mensagemSucesso.textContent = 'Formulário enviado com sucesso! (Não há backend para processar os dados)';
        mensagemSucesso.style.color = 'green';
        
        // Opcional: Limpar o formulário e reabilitar apenas o primeiro campo
        // form.reset(); 
        // for (let i = 0; i < dataSelectors.length; i++) {
        //     toggleDataField(i, i === 0);
        // }
    });
});
