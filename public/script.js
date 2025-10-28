document.getElementById('botForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
  
    document.getElementById('response').innerHTML = '';
  
    try {
      const response = await fetch('/enviar-mensagem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const statusMessages = await response.json();
  
      statusMessages.forEach(message => {
        const p = document.createElement('p');
        p.textContent = message;
        document.getElementById('response').appendChild(p);
      });
  
    } catch (error) {
      const p = document.createElement('p');
      p.textContent = 'Ocorreu um erro. Tente novamente.';
      document.getElementById('response').appendChild(p);
    }
  });

  
