const { Client, GatewayIntentBits } = require('discord.js');

async function iniciarBot(token, guildId, quantidade, delayEmSegundos, mensagem, callback) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessages,
    ],
  });

  client.once('ready', async () => {
    console.log(`✅ Bot logado como ${client.user.tag}`);

    const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);

    if (!guild) {
      callback('❌ O bot não está no servidor especificado.');
      return;
    }

    console.log(`Bot enviando mensagens para membros do/a ${guild.name}`);

    await guild.members.fetch();
    const membros = guild.members.cache
      .filter((m) => !m.user.bot)
      .first(quantidade);

    callback(`📨 Enviando mensagem para ${membros.length} membros com delay de ${delayEmSegundos}s...`);

    membros.forEach((membro, index) => {
      setTimeout(async () => {
        try {
          await membro.send(mensagem);
          callback(`✅ Mensagem enviada para: ${membro.user.tag}`);
        } catch (err) {
          callback(`⚠️ Não foi possível enviar para: ${membro.user.tag}`);
        }
      }, index * delayEmSegundos * 1000);
    });
  });

  client.login(token);
}

module.exports = iniciarBot;

