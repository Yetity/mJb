const { Interaction, Client, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const User = require('../../models/User')
const workAr = require('../../utils/work/work.json')
const workPay = require('../../utils/work/workPay.json')

/**
 * 
 * @param {Object[]} ar 
 * @param {Integer} amt 
 * @param {Boolean} pay 
 * @returns String
 */
const rnd = (ar,pay, option) => {
    let filteredAr
    if (pay === true) {
        filteredAr = ar.filter(el => el.pay === true);
    } else if (pay === false) {
        filteredAr = ar.filter(el => el.pay === false);
    }
    let ans = filteredAr.filter(job => job.type === option)
    var lastAns = ans[Math.floor(Math.random() * ans.length)]
    return {
        answer: lastAns.cont,
        type: lastAns.type
    }
}

module.exports = {
    name:"work",
    description:"mm",
    blacklist: true,
    cooldown: '10s',
    options: [
        {
            name:"job",
            description:"Where do you want to work.",
            required: true,
            choices:[
                {
                    name:"Tailor",
                    value:"tailor"
                },
                {
                    name:"Farmer",
                    value:"farmer"
                },
                {
                    name:"Gamer",
                    value:"gamer"
                },
                {
                    name:"Youtuber",
                    value:"youtuber"
                },
                {
                    name:"Twitch Streamer",
                    value:"twitch-streamer"
                },
                {
                    name:"Discord Moderator",
                    value:"discord-mod"
                },
                {
                    name:"Teacher",
                    value:"teacher"
                },
                {
                    name:"Chef",
                    value:"chef"
                },
                {
                    name:"Pilot",
                    value:"pilot"
                },
                {
                    name:"Servant",
                    value:"servant"
                },
                {
                    name:"Police",
                    value:"police"
                },
                {
                    name:"Miner",
                    value:"miner"
                },
                {
                    name:"Construction worker",
                    value:"construction-worker"
                }
                
            ],
            type: ApplicationCommandOptionType.String
        }
    ],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        try {
            await interaction.deferReply();
            let embed = []
            const query = {
                userId: interaction.user.id
            };
            let earn = Math.random() <= 0.25 ? false : true;

            let option = interaction.options.get("job").value
            let reply = rnd(workAr, earn, option)
            let job = workPay.find(job => job.type === option);
            let payment = Math.floor(Math.random() * (job.max - job.min) ) + job.min;
            let work = reply.answer.replace("{AMT}", `**${payment}**`)

            earn == true ? embed.push(new EmbedBuilder().setTitle("Nice work").setColor("Green").setDescription(`${work}`)) : embed.push(new EmbedBuilder().setTitle("... work").setColor("Red").setDescription(`${work}`))
            
            let user = await User.findOne(query)

            if (user) {
                if (earn === true) {
                    interaction.editReply({embeds: embed})

                    user.balance += payment
                } else {
                    interaction.editReply({embeds: embed})
                    if (reply.includes("{AMT}") == true) user.balance -= payment;
                }

                await user.save()
            } else {
                if (earn === true) {
                    interaction.editReply({embeds: embed})
                    user = new User({
                        ...query,
                        balance: payment
                    })
                } else {
                    embed.push(new EmbedBuilder().setTitle("Saved from debt!").setDescription("Due to you being a new user, you've been saved from debt. Lucky"))
                    interaction.editReply({embeds: embed})
                    user = new User({
                        ...query,
                        balance: payment
                    })
                }

                await user.save();
            }

        } catch (error) {
            console.log('error wit work')
            console.log(error)
        }
    }
}