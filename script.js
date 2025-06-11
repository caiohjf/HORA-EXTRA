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
    
    const regrasCampoData = [
        { index: 0, tipo: 'fimDeSemanaPuro', obrigatorio: true, msgErro: 'Primeira data deve ser um sábado ou domingo.' },
        { index: 1, tipo: 'todosDiasValidos', obrigatorio: false, msgErro: '' }, 
        { index: 2, tipo: 'fimDeSemanaPuro', obrigatorio: false, msgErro: 'Terceira data deve ser um sábado ou domingo.' },
        { index: 3, tipo: 'todosDiasValidos', obrigatorio: false, msgErro: '' }
    ];

    function gerarDatasValidasDoMes(filterType = 'todosDiasValidos') {
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth();
        const datasValidas = [];

        const ultimoDiaDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

        for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
            const data = new Date(anoAtual, mesAtual, dia);
            const diaDaSemana = data.getDay();

            const isWeekend = (diaDaSemana === 0 || diaDaSemana === 6);
            const isWeekdaySpecial = (diaDaSemana === 2 || diaDaSemana === 4);

            let shouldAddDate = false;

            if (filterType === 'fimDeSemanaPuro') {
                if (isWeekend) {
                    shouldAddDate = true;
                }
            } else if (filterType === 'todosDiasValidos') { 
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
     * Popula um elemento <select> com as datas válidas.
     * O value do option volta a ser o timestamp, e o textContent é a data formatada.
     * A formatação para envio será feita no submit do formulário.
     * @param {HTMLElement} selectElement - O elemento <select> a ser populado.
     * @param {number} fieldIndex - O índice do campo de data (0 a 3).
     */
    function popularSelectDeData(selectElement, fieldIndex) {
        const regra = regrasCampoData[fieldIndex];
        let datas;

        if (regra.tipo === 'fimDeSemanaPuro') {
            datas = gerarDatasValidasDoMes('fimDeSemanaPuro');
        } else {
            datas = gerarDatasValidasDoMes('todosDiasValidos');
        }
        
        selectElement.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Selecione uma data";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);

        if (!regra.obrigatorio) {
            const emptyOption = document.createElement('option');
            emptyOption.value = "";
            emptyOption.textContent = "Não selecionar";
            selectElement.appendChild(emptyOption);
        }

        datas.forEach(data => {
            const option = document.createElement('option');
            // Revertendo para o timestamp no value do option
            option.value = data.date.getTime(); 
            option.textContent = data.formatted; // O texto visível continua sendo formatado
            option.dataset.isWeekend = data.isWeekend; 
            selectElement.appendChild(option);
        });
    }

    function toggleDataField(fieldIndex, enable) {
        const selectElement = dataSelectors[fieldIndex];
        selectElement.disabled = !enable;
        if (enable) {
            popularSelectDeData(selectElement, fieldIndex);
        } else {
            selectElement.innerHTML = `<option value="" disabled selected>Selecione uma data</option>`;
            if (!regrasCampoData[fieldIndex].obrigatorio) {
                 selectElement.innerHTML += '<option value="">Não selecionar</option>';
            }
        }
        if (!enable) {
             mensagemSucesso.textContent = '';
        }
    }

    function validarCampoData(selectElement, fieldIndex) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const regra = regrasCampoData[fieldIndex];

        if (regra.obrigatorio && (!selectedOption || selectedOption.value === "")) {
            mensagemSucesso.textContent = `Por favor, selecione a ${fieldIndex + 1}ª data.`;
            mensagemSucesso.style.color = 'red';
            return false;
        }

        if (!regra.obrigatorio && (!selectedOption || selectedOption.value === "")) {
            mensagemSucesso.textContent = '';
            return true;
        }

        const isWeekendSelected = selectedOption.dataset.isWeekend === 'true';

        if (regra.tipo === 'fimDeSemanaPuro' && !isWeekendSelected) {
            mensagemSucesso.textContent = `${regra.msgErro}`;
            mensagemSucesso.style.color = 'red';
            return false;
        }
        
        mensagemSucesso.textContent = '';
        return true;
    }

    // --- Inicialização e Event Listeners ---

    toggleDataField(0, true);
    for (let i = 1; i < dataSelectors.length; i++) {
        toggleDataField(i, false);
    }

    maspInput.addEventListener('input', () => {
        maspInput.value = maspInput.value.replace(/[^0-9]/g, '');
    });

    dataSelectors.forEach((selectElement, index) => {
        selectElement.addEventListener('change', () => {
            mensagemSucesso.textContent = '';

            const isValidCurrentField = validarCampoData(selectElement, index);

            if (!isValidCurrentField) {
                for (let i = index + 1; i < dataSelectors.length; i++) {
                    toggleDataField(i, false);
                }
                return;
            }

            if (index < dataSelectors.length - 1) {
                toggleDataField(index + 1, true);
            }
            
            for (let i = index + 1; i < dataSelectors.length; i++) {
                if (!dataSelectors[i].disabled && dataSelectors[i].value !== "" && dataSelectors[i].options[dataSelectors[i].selectedIndex] && !dataSelectors[i].options[dataSelectors[i].selectedIndex].disabled) { 
                    if (!validarCampoData(dataSelectors[i], i)) {
                        for (let j = i + 1; j < dataSelectors.length; j++) {
                            toggleDataField(j, false);
                        }
                        break;
                    }
                } else if (dataSelectors[i].disabled) {
                    break;
                }
            }
        });
    });

    // --- MUDANÇA PRINCIPAL AQUI: NO EVENTO DE SUBMIT ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        mensagemSucesso.textContent = '';

        const nomeValido = form.elements['nome'].value.trim() !== '';
        const maspValido = maspInput.value.trim().length > 0;

        if (!nomeValido || !maspValido) {
            mensagemSucesso.textContent = 'Por favor, preencha o nome e o Masp.';
            mensagemSucesso.style.color = 'red';
            return;
        }

        let todasDatasValidas = true;
        for (let i = 0; i < dataSelectors.length; i++) {
            const selectElement = dataSelectors[i];
            const regra = regrasCampoData[i];

            if (regra.obrigatorio && (selectElement.disabled || selectElement.value === "")) {
                 mensagemSucesso.textContent = `Por favor, selecione a ${i + 1}ª data.`;
                 mensagemSucesso.style.color = 'red';
                 todasDatasValidas = false;
                 break;
            }
            
            if (!selectElement.disabled && !validarCampoData(selectElement, i)) {
                todasDatasValidas = false;
                break;
            }
        }

        if (!todasDatasValidas) {
            return; 
        }

        // Remover campos ocultos anteriores para evitar duplicatas
        const oldHiddenInputs = form.querySelectorAll('input[type="hidden"][data-custom-date="true"]');
        oldHiddenInputs.forEach(input => input.remove());

        // Criar um novo FormData
        const formData = new FormData(form); 

        // Para cada seletor de data, adicionamos um campo oculto com o texto formatado
        dataSelectors.forEach((selectElement, index) => {
            if (!selectElement.disabled && selectElement.value !== "") { // Se o campo está habilitado e uma data foi selecionada
                const selectedOption = selectElement.options[selectElement.selectedIndex];
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = `data${index + 1}_formatada`; // Nome diferente para evitar conflito com o select
                hiddenInput.value = selectedOption.textContent; // O texto formatado
                hiddenInput.dataset.customDate = 'true'; // Marcador para fácil remoção
                form.appendChild(hiddenInput); // Adiciona ao formulário
            }
        });

        try {
            const response = await fetch(form.action, { 
                method: 'POST',
                body: formData, // Continua usando formData que agora inclui os campos ocultos
                headers: {
                    'Accept': 'application/json' 
                }
            });

            if (response.ok) { 
                mensagemSucesso.textContent = 'Inscrição enviada com sucesso! Verifique seu email no Formspree.';
                mensagemSucesso.style.color = 'green';
                form.reset(); 
                for (let i = 0; i < dataSelectors.length; i++) {
                    toggleDataField(i, i === 0);
                }
            } else {
                const errorData = await response.json();
                console.error('Erro no envio do formulário:', errorData);
                mensagemSucesso.textContent = `Erro ao enviar o formulário: ${errorData.error || 'Tente novamente.'}`;
                mensagemSucesso.style.color = 'red';
            }
        } catch (error) {
            console.error('Erro de rede ou envio:', error);
            mensagemSucesso.textContent = 'Ocorreu um erro de conexão. Tente novamente mais tarde.';
            mensagemSucesso.style.color = 'red';
        } finally {
             // Remover os campos ocultos após o envio (sucesso ou falha)
            const oldHiddenInputs = form.querySelectorAll('input[type="hidden"][data-custom-date="true"]');
            oldHiddenInputs.forEach(input => input.remove());
        }
    });
});
