/* Ligação com o Google Forms.
   action: o endereço do formulário trocando "/viewform" por "/formResponse".
   fields: o código "entry.NNNNNNN" de cada pergunta (aparece no link pré-preenchido).
   Enquanto algum campo estiver vazio, o site mostra "As inscrições abrem em breve". */
window.LME_FORMS = {
  perfil: {
    action: '',
    fields: {
      nome: '', idade: '', cidade: '', email: '', whatsapp: '', organizacao: '', area: '',
      perfis: '', interesse: '', negocio: '', inovacao: '', competencias: '', procurando: '', ajudar: ''
    }
  },
  parceria: {
    action: '',
    fields: { nome: '', organizacao: '', tipo: '', contato: '', mensagem: '' }
  }
};
