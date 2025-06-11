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
    
    // Regras atualizadas: 'fimDeSemanaPuro' para apenas sábados/domingos
    const regrasCampoData = [
        { index: 0, tipo: 'fimDeSemanaPuro', obrigatorio: true, msgErro: 'Primeira data deve ser um sábado ou domingo.' },
        { index: 1, tipo: 'facultativa', obrigatorio: false, msgErro: '' }, 
        { index: 2, tipo: 'fimDeSemanaPuro', obrigatorio: false, msgErro: 'Terceira data deve ser um sábado ou domingo.' },
        { index: 3, tipo: 'facultativa', obrigatorio: false, msgErro: '' }
    ];

    /**
     * Gera e retorna um array com as datas válidas do mês e ano atual,
     * com opção de filtrar por tipo de dia (terça, quinta, sábado, domingo).
     * @param {string} filterType - 'todosDiasValidos' (terças, quintas, sábados, domingos) | 'fimDeSemanaPuro' (somente sábados, domingos).
     * @returns {Array<Object>} Um array de objetos, onde cada objeto tem { date: Date, formatted: string, isWeekend: boolean }.
     */
    function gerarDatasValidasDoMes(filterType = 'todosDiasValidos') {
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

            let shouldAddDate = false;

            if (filterType === 'fimDeSemanaPuro') {
                // Se o filtro é para puro fim de semana, só adiciona se for sábado ou domingo
                if (isWeekend) {
                    shouldAddDate = true;
                }
            } else { // filterType é 'todosDiasValidos' ou não especificado
                // Adiciona se for terça, quinta, sábado ou domingo
                if (isWeekend || isWeekdaySpecial) {
                    shouldAddDate = true;
                }
            }

            if (shouldAddDate) {
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
        let datas;

        // Chama gerarDatasValidasDoMes com o filtro correto baseado na regra
        if (regra.tipo === 'fimDeSemanaPuro') {
            datas = gerarDatasValidasDoMes('fimDeSemanaPuro');
        } else { // 'facultativa'
            datas = gerarDatasValidasDoMes('todosDiasValidos');
        }
        
        selectElement.innerHTML = ''; // Limpa as opções existentes

        // Adiciona a opção padrão "Selecione uma data"
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Selecione uma data";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);

        // Se não for obrigatório, permite uma opção para "Não selecionar"
        if (!regra.obrigatorio) {
            const emptyOption = document.createElement('option');
            emptyOption.value = "";
            emptyOption.textContent = "Não selecionar";
            selectElement.appendChild(emptyOption);
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
        if (enable) {
            // Sempre repopula para garantir que o filtro esteja correto
            popularSelectDeData(selectElement, fieldIndex);
        } else {
            // Se desabilitar, reseta a seleção e limpa as opções (exceto a padrão)
            selectElement.innerHTML = `<option value="" disabled selected>Selecione uma data</option>`;
            if (!regrasCampoData[fieldIndex].obrigatorio) {
                 selectElement.innerHTML += '<option value="">Não selecionar</option>';
            }
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

        // Se o campo for obrigatório e nada válido foi selecionado
        if (regra.obrigatorio && (!selectedOption || selectedOption.value === "" || selectedOption.disabled)) {
            mensagemSucesso.textContent = `Por favor, selecione a ${fieldIndex + 1}ª data.`;
            mensagemSucesso.style.color = 'red';
            return false;
        }

        // Se o campo não for obrigatório e não foi selecionado (opção vazia), está ok
        if (!regra.obrigatorio && selectedOption && selectedOption.value === "") {
            mensagemSucesso.textContent = ''; // Limpa a mensagem se estava exibindo algo
            return true;
        }

        const isWeekendSelected = selectedOption.dataset.isWeekend === 'true';

        // Valida a regra específica de tipo de dia (fimDeSemanaPuro)
        if (regra.tipo === 'fimDeSemanaPuro' && !isWeekendSelected) {
            mensagemSucesso.textContent = `${regra.msgErro}`;
            mensagemSucesso.style.color = 'red';
            return false;
        }
        
        mensagemSucesso.textContent = ''; // Limpa a mensagem se válido
        return true;
    }

    // --- Inicialização e Event Listeners ---

    // Inicializa o primeiro seletor de data e desabilita os outros
    toggleDataField(0, true); // Habilita e popula o campo 1 com sábados/domingos
    for (let i = 1; i < dataSelectors.length; i++) {
        toggleDataField(i, false); // Desabilita e limpa os campos 2, 3 e 4
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
                // Se a validação do campo atual falhou, desabilita e reseta os próximos
                for (let i = index + 1; i < dataSelectors.length; i++) {
                    toggleDataField(i, false);
                }
                return;
            }

            // Se o campo atual foi preenchido e validado, habilita o próximo (se existir)
            if (index < dataSelectors.length - 1) {
                toggleDataField(index + 1, true);
            }
            
            // Revalida campos subsequentes que já foram preenchidos
            for (let i = index + 1; i < dataSelectors.length; i++) {
                // Só revalida se o campo está habilitado e tem um valor selecionado
                if (!dataSelectors[i].disabled && dataSelectors[i].value !== "") { 
                    if (!validarCampoData(dataSelectors[i], i)) {
                        // Se a revalidação falhar, desabilita e reseta os campos a partir daqui
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

        // Validação básica de campos obrigatórios (Nome e Masp)
        const nomeValido = form.elements['nome'].value.trim() !== '';
        const maspValido = maspInput.value.trim().length > 0;

        if (!nomeValido || !maspValido) {
            mensagemSucesso.textContent = 'Por favor, preencha o nome e o Masp.';
            mensagemSucesso.style.color = 'red';
            return;
        }

        let todasDatasValidas = true;
        // Valida cada campo de data, respeitando a obrigatoriedade e o estado (habilitado/desabilitado)
        for (let i = 0; i < dataSelectors.length; i++) {
            const selectElement = dataSelectors[i];
            const regra = regrasCampoData[i];

            // Se o campo é obrigatório mas está desabilitado, ou se não foi preenchido corretamente
            if (regra.obrigatorio && (selectElement.disabled || selectElement.value === "")) {
                 mensagemSucesso.textContent = `Por favor, selecione a ${i + 1}ª data.`;
                 mensagemSucesso.style.color = 'red';
                 todasDatasValidas = false;
                 break;
            }
            
            // Se o campo está habilitado e não vazio, ou se é facultativo e está vazio, valide-o
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
        
        // Opcional: Limpar o formulário e reabilitar apenas o primeiro campo para um novo preenchimento
        // form.reset(); 
        // for (let i = 0; i < dataSelectors.length; i++) {
        //     toggleDataField(i, i === 0);
        // }
    });
});
