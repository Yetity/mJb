const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const User = require('../../models/User')

module.exports = {
    name:"deposit",
    description:"Deposit coins into your bank",
    options: [
        {
            name:"amount",
            description:"how much to deposit",
            required: true,
            type: ApplicationCommandOptionType.Number
        }
    ],
    blacklist: true,

    /**
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {
        try {
            await interaction.deferReply();

            const amount = interaction.options.get("amount").value;
            const query = {
                userId: interaction.user.id
            }
            let user = await User.findOne(query)

            if (!user) {
                await interaction.followUp({ content:"Why deposit when you've got nothing?", ephemeral: true });
                return;
            }

            if (!user.balance) {
                await interaction.followUp({ content:"You exist in the database but have no money weird", ephemeral: true });
                return;
            }

            if (amount > user.balance) {
                await interaction.followUp({ content:`**${amount}** is **__${amount - user.balance}__** more than what you have`, ephemeral: true });
                return;
            }

            if (amount < 0) {
                await interaction.followUp({ content:"You can't deposit numbers smaller than zerp", ephemeral: true });
                return;
            }

            user.balance -= amount
            user.bank += amount

            await user.save()

            interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setTitle("Successful Deposit.")
                    .setDescription(`Successfully deposited **${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}**. Your balance is now **${user.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}**`)
            ]})
        } catch (error) {
			interaction.editReply('An error occured.')
			client.guilds.cache.get("808701451399725116").channels.cache.get("971098250780241990").send({ embeds : [
				new EmbedBuilder()
				.setTitle(`An error occured. Command name = ${interaction.commandName}`)
				.setDescription(`\`${error}\``)
				.setTimestamp()
				.setFooter({text:`Server ID : ${interaction.guild.id} | User ID : ${interaction.user.id} | Error was also logged to console.`})
			]})
			console.log(error)
		}
    }
}