/*
Link social accounts

Issue this script to link a social media account to this discord account.

User requests linking giving
service to link, indivigual username

bot generates a hash and passes the user the salt to send from new account
if it matches from new account and username is right assume its the user and connect in DB

command flow - 
  check if discord user has account
    if so check if alt_service username is found in $service_users database
      if so is $user_salt given
        if so and matches connect services users, merge the younger user into the older, sending funds and modifying the database as needed so the user can share balance on both
        if not fail with instructions
      if not GENERATE $link_salt and $hash with the user key, send the user the salt and save the salted hash. wait for verification or expiration
    if not check if alt account exists
      if so did they pass the salt? is the link request in the database?
        if so and salt matches, link $service_users in database linking accounts to the same wallet
        if not fail with instructions
      if not fail and ask user to sign up from one of the accounts



*/

module.exports = {
  name: 'link',
  description: 'Link Social Accounts',
  args: false,
  aliases: ['connect', 'pair', 'join', 'combine' ],
  guildOnly: false,
  usage: '{*alias*: connect || pair || join || combine }\nLink various social media account to the same address in the tipbot',

  execute(message, args) {
    // const config = require('../../../_config/config.json');
    const Discord = require('discord.js');
    // const chalk = require('chalk');
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const uuid = `${message.author}`;
    const service_id = uuid.slice(1, -1);
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const getBalance = wallet.GetBalance;
    const userInfoArray = [];
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(25);
    const pw = Math.random().toString(36).substring(7);
    console.log(`pw: ${pw}`);
    const hash = bcrypt.hashSync(`"${pw}"`, salt);
    console.log(`hash: ${hash}`);
    

    let service;
    let serviceIndex;

    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 500);
    }

    // errorMessage({ error: 'Can\'t access faucet from DM!', description: 'Please try again from the main chat, this function will only work there.' });
    function errorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      message.channel.startTyping();
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x000000)
          .setTitle(':warning:  ERROR: ' + content.error)
          .setDescription(content.description)
          .setFooter(footer);
        message.reply({ embed });
        message.channel.stopTyping(true);
      }, 500);
    }

    async function checkUser(user) {
      return new Promise(resolve => {
        const check_info = { service: 'discord', service_id: user };
console.log(check_info);
        const checkPromise = GetAllUserInfo(check_info);
        // fail from the start
        let checkUserPassed = false;
        checkPromise.then(function(results) {
          userInfoArray.push(results);
          const user_found = results[0].user_found;
          const opt_out = results[0].opt_out;
          const agree = results[0].user_agree;
          // check if user found
          if (user_found) {
            checkUserPassed = true;
            userInfoArray.push({ checkUserPassed: checkUserPassed });
          }
          else{
            // user not found
            userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_found' });
            errorMessage({ error: 'User Not Found...', description: 'Please enter `' + config.discord.prefix + 'add` to sign-up then `' + config.discord.prefix + 'agree` to start using the bot' });
            return;
          }
          // check if agreed
          if (agree) {
            // set checkUserPassed to true and return
            let checkUserPassed = true;
            userInfoArray.push({ checkUserPassed: checkUserPassed });
          }
          else {
            // not agreed to terms
            userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_agreed' });
            errorMessage({ error: 'User Has Not Agreed to Terms...', description: 'You must agree to the terms, enter `' + config.discord.prefix + 'terms` to read the terms and conditions, `' + config.discord.prefix + 'agree` to start using the bot.' });
            return;
          }
          // check if opt out
          if (opt_out) {
          // user has opted out
            userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'opted_out' });
            errorMessage({ error: 'User Has Opted Out...', description: 'Please `' + config.discord.prefix + 'opt-in` to use the bot.' });
            return;
          }
          resolve(userInfoArray);
          return;
        });
      });
    }

    // ////////////
    // checks
    // ////////////
    console.log(`args: ${JSON.stringify(args)}\nargs.length: ${args.length}\nmessage: ${message}\nservices: ${config.services}`);
    // get service or fail
    for(let i = 0, l = args.length; i < l; i++) {
      console.log(`args[i]: ${args[i]}`);
      serviceIndex = (config.services.indexOf(args[i]) > -1);
      console.log(`serviceIndex: ${serviceIndex}`);
      if (serviceIndex) {
        service = args[i];
        break;
      }
    }
    // did service get set?
    if (!service){
      errorMessage({ error: 'Service Not Given...', description: 'You must give a service to link. `+link twitter @USERNAME`' });
      return;
    }
    // did user send a linked user name for the new service
    if (!args[1]) {
      // not enough args given...
      errorMessage({ error: 'Linked user Not Given...', description: 'You must give a user name to link. `+link twitter @USERNAME`' });
      return;
    }
    // check on user here in discord, if not found, opt-out, not agreed, or banned... fail
    checkUser(service_id).then(function(userInfo) {
      console.log(JSON.stringify(userInfo));
      // user found, get random data and create salt
      console.log(`user Salt: ${salt}`);




    });
  },
};