
const salvarTarefa = (tarefa) => {

  const tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
  tarefas.push(tarefa);
  localStorage.setItem('tarefas', JSON.stringify(tarefas));

};

document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('cadatrar').addEventListener('click', function() {
    
    let msg = [];
    const tarefa = {};

    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const categoria = document.getElementById('categoria').value;
    const prioridade = document.getElementById('prioridade').value;
    const data = document.getElementById('data').value;
    const formError = document.getElementById('form-error');

    if(titulo.length < 5)
      msg.push('O título deve ter pelo menos 5 caracteres.');
    if(descricao.length < 10)
      msg.push('A descrição deve ter pelo menos 10 caracteres.');
    if(categoria === '0')
      msg.push('Selecione uma categoria.');
    if(prioridade === '0')
      msg.push('Selecione uma prioridade.');
    if(!data)
      msg.push('Selecione uma data de conclusão.');

    if(msg.length > 0) {
      formError.replaceChildren();
      const ul = document.createElement('ul');
      msg.forEach(function(mensagem) {
        const li = document.createElement('li');
        li.textContent = mensagem;
        ul.appendChild(li);
      });
      formError.appendChild(ul);
      formError.style.display = 'block';
      formError.focus();
    }
    else{
      tarefa.id = crypto.randomUUID();
      tarefa.titulo = titulo;
      tarefa.descricao = descricao;
      tarefa.categoria = categoria;
      tarefa.prioridade = prioridade;
      tarefa.data = data;
      salvarTarefa(tarefa);
      formError.replaceChildren();
      const textNode = document.createTextNode('Tarefa cadastrada com sucesso!');
      formError.appendChild(textNode);
      formError.classList.add('ok'); 
      formError.style.display = 'block';
    }

  });

});
