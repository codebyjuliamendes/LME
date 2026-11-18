/* Ligação com o Supabase e (opcionalmente) Google Forms. */
window.LME_SUPABASE = {
  url: 'https://bknasghbbohlonxgdbvr.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbmFzZ2hiYm9obG9ueGdkYnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4OTEwNzcsImV4cCI6MjExMDQ2NzA3N30.5G1y4yBfD5iuCVjTKcS4-2NdEMhzbUypy7UJN9HdYNI'
};

/* Opcional: Google Forms.
   action: o endereço do formulário trocando "/viewform" por "/formResponse".
   fields: o código "entry.NNNNNNN" de cada pergunta (aparece no link pré-preenchido). */
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
