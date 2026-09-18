const STORAGE_KEY = 'gerenciador_tarefas_v1';

const form = document.getElementById('task-form');
const descricaoInput = document.getElementById('descricao');
const categoriaInput = document.getElementById('categoria');
const prioridadeInput = document.getElementById('prioridade');
const dataInput = document.getElementById('data');
const formError = document.getElementById('form-error');

const filtroStatus = document.getElementById('filtro-status');
const filtroCategoria = document.getElementById('filtro-categoria');

const totalEl = document.getElementById('total-tarefas');
const pendentesEl = document.getElementById('pendentes-tarefas');
const concluidasEl = document.getElementById('concluidas-tarefas');

const listaTarefasEl = document.getElementById('lista-tarefas');

let tarefas = carregarTarefas();

function salvarTarefas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
}

function carregarTarefas() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function validarFormulario() {
  const descricao = descricaoInput.value.trim();
  const categoria = categoriaInput.value;
  const prioridade = prioridadeInput.value;
  const data = dataInput.value;

  if (!descricao) return 'A descrição não pode estar vazia.';
  if (!categoria) return 'Selecione uma categoria.';
  if (!prioridade) return 'Selecione uma prioridade.';
  if (!data) return 'Informe a data de conclusão.';

  return '';
}

function formatarData(dataISO) {
  if (!dataISO || !dataISO.includes('-')) return dataISO || '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function gerarId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return String(Date.now() + Math.random());
}

function adicionarTarefa({ descricao, categoria, prioridade, data }) {
  const novaTarefa = {
    id: gerarId(),
    descricao,
    categoria,
    prioridade,
    data,
    concluida: false,
  };

  tarefas.push(novaTarefa);
  salvarTarefas();
}

function excluirTarefa(id) {
  tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
  salvarTarefas();
}

function alternarConclusao(id) {
  tarefas = tarefas.map((tarefa) => {
    if (tarefa.id !== id) return tarefa;
    return { ...tarefa, concluida: !tarefa.concluida };
  });
  salvarTarefas();
}

function atualizarIndicadores() {
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.concluida).length;
  const pendentes = total - concluidas;

  totalEl.textContent = String(total);
  pendentesEl.textContent = String(pendentes);
  concluidasEl.textContent = String(concluidas);
}

function atualizarFiltroCategoria() {
  const valorAtual = filtroCategoria.value;
  const categoriasUnicas = [...new Set(tarefas.map((t) => t.categoria))];

  filtroCategoria.innerHTML = '<option value="todas">Todas</option>';
  categoriasUnicas.forEach((categoria) => {
    const option = document.createElement('option');
    option.value = categoria;
    option.textContent = categoria;
    filtroCategoria.appendChild(option);
  });

  if ([...filtroCategoria.options].some((opt) => opt.value === valorAtual)) {
    filtroCategoria.value = valorAtual;
  }
}

function filtrarTarefas() {
  const status = filtroStatus.value;
  const categoria = filtroCategoria.value;

  return tarefas.filter((tarefa) => {
    const okStatus =
      status === 'todas' ||
      (status === 'pendentes' && !tarefa.concluida) ||
      (status === 'concluidas' && tarefa.concluida);

    const okCategoria = categoria === 'todas' || tarefa.categoria === categoria;

    return okStatus && okCategoria;
  });
}

function criarCardTarefa(tarefa) {
  const item = document.createElement('article');
  item.className = `task-item${tarefa.concluida ? ' concluida' : ''}`;
  item.setAttribute('role', 'listitem');

  const top = document.createElement('div');
  top.className = 'task-top';

  const descricao = document.createElement('p');
  descricao.className = 'task-desc';
  descricao.textContent = tarefa.descricao;

  const prioridade = document.createElement('span');
  prioridade.className = `badge ${tarefa.prioridade}`;
  prioridade.textContent = tarefa.prioridade;

  top.appendChild(descricao);
  top.appendChild(prioridade);

  const categoria = document.createElement('p');
  categoria.className = 'task-meta';
  categoria.textContent = `Categoria: ${tarefa.categoria}`;

  const data = document.createElement('p');
  data.className = 'task-meta';
  data.textContent = `Data: ${formatarData(tarefa.data)}`;

  const situacao = document.createElement('p');
  situacao.className = 'task-meta';
  situacao.textContent = `Situação: ${tarefa.concluida ? 'Concluída' : 'Pendente'}`;

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'secondary';
  toggleBtn.textContent = tarefa.concluida ? 'Marcar como pendente' : 'Marcar como concluída';
  toggleBtn.setAttribute(
    'aria-label',
    `${tarefa.concluida ? 'Marcar como pendente' : 'Marcar como concluída'}: ${tarefa.descricao}`
  );

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'danger';
  deleteBtn.textContent = 'Excluir';
  deleteBtn.setAttribute('aria-label', `Excluir tarefa: ${tarefa.descricao}`);

  actions.appendChild(toggleBtn);
  actions.appendChild(deleteBtn);

  item.appendChild(top);
  item.appendChild(categoria);
  item.appendChild(data);
  item.appendChild(situacao);
  item.appendChild(actions);

  toggleBtn.addEventListener('click', () => {
    alternarConclusao(tarefa.id);
    renderizar();
  });

  deleteBtn.addEventListener('click', () => {
    const confirmado = window.confirm('Deseja realmente excluir esta tarefa?');
    if (!confirmado) return;
    excluirTarefa(tarefa.id);
    renderizar();
  });

  return item;
}

function renderizarLista() {
  const tarefasVisiveis = filtrarTarefas();
  listaTarefasEl.innerHTML = '';

  if (tarefas.length === 0) {
    listaTarefasEl.innerHTML =
      '<p class="empty" role="listitem">Nenhuma tarefa cadastrada. Adicione uma tarefa para começar!</p>';
    return;
  }

  if (tarefasVisiveis.length === 0) {
    listaTarefasEl.innerHTML =
      '<p class="empty" role="listitem">Nenhuma tarefa encontrada com os filtros selecionados.</p>';
    return;
  }

  tarefasVisiveis.forEach((tarefa) => {
    listaTarefasEl.appendChild(criarCardTarefa(tarefa));
  });
}

function limparFormulario() {
  form.reset();
  formError.textContent = '';
}

function renderizar() {
  atualizarFiltroCategoria();
  atualizarIndicadores();
  renderizarLista();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const erro = validarFormulario();
  formError.textContent = erro;
  if (erro) return;

  adicionarTarefa({
    descricao: descricaoInput.value.trim(),
    categoria: categoriaInput.value,
    prioridade: prioridadeInput.value,
    data: dataInput.value,
  });

  limparFormulario();
  renderizar();
});

filtroStatus.addEventListener('change', renderizarLista);
filtroCategoria.addEventListener('change', renderizarLista);

renderizar();
