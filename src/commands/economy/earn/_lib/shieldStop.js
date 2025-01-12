const isCommand = false;
const rndInt = require("../../../../utils/misc/rndInt");
const { EmbedBuilder, Client, CommandInteraction } = require("discord.js");
const { comma } = require("../../../../utils/formatters/beatify");
const User1 = require("../../../../models/User");
const { Inventory, User } = require("../../../../models/cache");

/**
 * Handles the shield stop interaction, processing the shield damage
 * inflicted on the victim's shield and sending appropriate messages
 * to both the command issuer and the victim.
 *
 * @param {Client} client - The Discord client instance used to interact with the API.
 * @param {CommandInteraction} interaction - The interaction object containing information about the command.
 * @param {Inventory} inventory - The inventory of the command issuer, containing details about shields.
 * @param {User} victim - The user object representing the victim of the interaction.
 * @param {string[]} errorMsg - An array of error messages; the first element is the returned string for the command issuer,
 * and the second is the message to be sent to the victim's DM.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the shield interaction was successful.
 */
async function shieldStop(client, interaction, inventory, victim, errorMsg) {
    let shieldStop = false;
    if (!inventory) return shieldStop;
    const victimDm = await client.users
        .fetch(interaction.options.get("user").value)
        .catch(() => null); // to dm the user.

    if (inventory.shield.amt > 0 && inventory.shield.hp > 0) {
        let damage = rndInt(
            Math.floor(inventory.shield.hp / 2),
            inventory.shield.hp
        );
        await interaction.editReply({
            embeds: [
                new EmbedBuilder().setDescription(
                    errorMsg[0] +
                        ` but this user had a shield! You damaged their shield by **${comma(
                            damage
                        )}%**`
                ),
            ],
        });
        inventory.shield.hp -= damage;

        await victimDm
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Your shield has been damaged!")
                        .setDescription(
                            `<@${interaction.user.id}> tried ` +
                                errorMsg[1] +
                                ` but instead damaged your shield by **${comma(
                                    damage
                                )}%**`
                        )
                        .setFooter({
                            text: `Server = ${interaction.member.guild.name}`,
                        }),
                ],
            })
            .catch(() => null);
        await User1.save(victim);
        if (inventory.shield.hp == 0) {
            inventory.shield.amt -= 1;
            inventory.shield.hp = 500;
            await interaction.followUp("You broke this user's shield.");
            await User.save(victim);

            await victimDm
                .send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Your shield has been broken!")
                            .setDescription(
                                `<@${interaction.user.id}> managed to break your shield! You now have **${inventory.shield.amt}** shields left.`
                            )
                            .setFooter({
                                text: `Server = ${interaction.member.guild.name}`,
                            }),
                    ],
                })
                .catch(() => null);
        }
        shieldStop = true;
    }
    return shieldStop;
}

module.exports = { isCommand, shieldStop };
