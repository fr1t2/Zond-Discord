module.exports = {
  name: 'one',
  description: 'One QRL - 1 Quanta Reward, +0ne',
  args: false,
  aliases: ['plusone', 'PlusOne', 'Plusone', 'onequanta', 'oneQuanta', 'Onequanta', 'OneQuanta', 'ONE', 'One', 'ONe', 'otdto'],
  guildOnly: false,
  usage: ' ',
  cooldown: 0,

  execute(message, args) {
    const Discord = require('discord.js');
    const chalk = require('chalk');
    const dbHelper = require('../../db/dbHelper');
    const plusOneHelper = require('../../plusone/plusoneDB_Helper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const emojiCharacters = require('../../emojiCharacters');
    const uuid = `${message.author}`;

    const service_id = uuid.slice(1, -1);

    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const checkUserPlusOne = plusOneHelper.CheckPlusOne;
    const insertUserPlusOne = plusOneHelper.InsertPlusOne;
    const updateUserPlusOne = plusOneHelper.UpdatePlusOne;
    const updateUserPlusOneKey = plusOneHelper.UpdatePlusOneKey

    const getBalance = wallet.GetBalance;


    const userInfoArray = [];
//    const faucetResponse = require('../faucet-response.json');
//    const totalDrips = faucetHelper.totalPaid;
//    const faucetDrip = faucetHelper.Drip;


    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.channel.stopTyping(true);
        message.reply(content)
          // delete the message after a bit
          .then(msg => {
            setTimeout(() => msg.delete(), 10000)
          })
          .catch( );
      }, 100);
    }

    function errorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      // errorMessage({ error: 'XXXXX', description: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY' });
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

    function oneErrorMessage(content) {
      // oneErrorMessage({ error: 'XXXXX', description: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY' });
      message.channel.startTyping();
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x000000)
          .setTitle('Oops!\t' + content.error)
          .setDescription(content.description);
        message.reply({ embed });
        message.channel.stopTyping(true);
      }, 500);
    }

    function oneMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      // oneMessage({ source: 'XXXXX', title: 'YYYYYYYY', message: 'ZZZZZZZZZZ' }, footer...);
      message.channel.startTyping();
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor('BLUE')
          .setURL(content.source)
          .setTitle(content.title)
          .setDescription(`${content.message} \n[More info here](${content.source})`)
          .setFooter(footer);
        message.reply({ embed });
        message.channel.stopTyping(true);
      }, 1000);
    }


//    function millisToMinutesAndSeconds(millisec) {
//      let seconds = (millisec / 1000).toFixed(0);
//      let minutes = Math.floor(seconds / 60);
//      let hours = '';
//      if (minutes > 59) {
//        hours = Math.floor(minutes / 60);
//        hours = (hours >= 10) ? hours : '0' + hours;
//        minutes = minutes - (hours * 60);
//        minutes = (minutes >= 10) ? minutes : '0' + minutes;
//      }
//      seconds = Math.floor(seconds % 60);
//      seconds = (seconds >= 10) ? seconds : '0' + seconds;
//      if (hours != '') {
//        if ( seconds == 0) {
//          if (minutes == 0) {
//            return hours + 'hr';  
//          }
//          return hours + 'hr ' + minutes + 'min';  
//        }
//        return hours + 'hr ' + minutes + 'min ' + seconds + 'sec';
//      }
//      if (seconds == 0 ) {
//        return minutes + 'min';
//      }
//      else if (minutes == 0 ) {
//        return seconds + 'sec';
//      }
//      else {
//        return minutes + 'min ' + seconds + 'sec';
//      }
//    }



    // check if this is a DM and if so, block forcing user into the chat room
    if (message.channel.type === 'dm' && args[0] != "verify") {
      errorMessage({ error: 'Can\'t access +one from DM!', description: 'Please try again from the QRL Discord Server, this function will only work there.' });
      return;
    }

      // If not specified channel, fail and remove bots message
//    if (message.channel.name !== 'bot') {
      // check if the message is in an approved channel
      // TODO: Add this to the config and parse from a list of approved channels
//      message.channel.startTyping();
//      setTimeout(function() {
//        message.channel.stopTyping(true);
//        message.reply('Please use the #bot channel for faucet functions...')
//          // delete the message after a bit
//          .then(msg => {
//            setTimeout(() => msg.delete(), 10000)
//          })
//          .catch( );
//      }, 500);
//      return;
//    }
//

    // check for a balance in the +one wallet first
    async function oneWalletBalance() {
      return new Promise(function(resolve) {
      // using the +one address check for a balance
        const walletAddress = config.plusone.wallet_pub;
        getBalance(walletAddress).then(function(balance) {
          resolve(balance);
        });
      });
    }



    async function checkUser(user) {
      return new Promise(resolve => {
        const check_info = { service: 'discord', service_id: user };
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
            errorMessage({ error: 'User Not Found...', description: 'Please enter `' + config.discord.prefix + 'add` to sign-up then `' + config.discord.prefix + 'agree` to start using the bot then try this again!' });
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
          userInfoArray.push({ results: results });          
          resolve(userInfoArray);
//          return;
        });
      });
    }

    async function checkPlusOne(user_id) {
      // Check if user is found in plusone table already
      return new Promise(resolve => {
        const check_info = { service: 'discord', user_id: user_id };
        const checkFaucetPromise = checkUserPlusOne(check_info);
        // fail from the start
        checkFaucetPromise.then(function(results) {
          resolve(results);
        });
      });
    }

    async function insertPlusOne(user_id) {
      // Insert user into plusone table
      return new Promise(resolve => {
        const check_info = { service: 'discord', user_id: user_id };
        const checkFaucetPromise = insertUserPlusOne(check_info);
        // fail from the start
        checkFaucetPromise.then(function(results) {
          resolve(results);
        });
      });
    }

//    async function updatePlusOne(user_id) {
//      // Update plusone table when tx is paid out
//      return new Promise(resolve => {
//        const check_info = { service: 'discord', user_id: user_id };
//        const checkFaucetPromise = updateUserPlusOne(check_info);
//        // fail from the start
//        checkFaucetPromise.then(function(results) {
//          resolve(results);
//        });
//      });
//    }

    async function updatePlusOneKey(user_id) {
      // Update plusone key when user requests
      return new Promise(resolve => {
        const check_info = { service: 'discord', user_id: user_id };
        const checkFaucetPromise = updateUserPlusOneKey(check_info);
        // fail from the start
        checkFaucetPromise.then(function(results) {
          resolve(results);
        });
      });
    }

// --------------------------------------------------------------------------------------------------------------- //
// Main Program
// --------------------------------------------------------------------------------------------------------------- //
/*

- Check for balance in plusone wallet address
- Check for user in tipbot, if not found prompt to sign up
- Check for user in plusone table already
  - If found and user didn't enter args, send message showing user already completed
  - IF args key, generate a new key (hash) and send the salt to the user in DM
  - IF args verify AND user is authorized AND in DM, using list of salts provided to verify they exist. 
    - Results returned in csv/json including discord user ID, time signed up or nothing if not found 
  - IF NOT found add user to plusone table and return verification message

Payout happens in a separate script combining a group up to 100 addresses together ran through cron.

*/
// --------------------------------------------------------------------------------------------------------------- //
    const userArray = [];
    oneWalletBalance()
    // Check wallet and return if no funds there
      .then(function(balanceRes) {
        // fail if no funds in wallet
        if (balanceRes.balance < '1') {
          console.log(chalk.red('!!! ') + chalk.bgRed(' The +One wallet is flat... ') + chalk.red('Add funds to: ') + chalk.bgRed(config.plusone.wallet_pub));
          errorMessage({ error: '+One wallet is out of funds...', description: 'Please notify a moderator or admin to top it off.' });
          return;
        }
        // Check for the user and if not signed up, opted out or not agreed fail and error
        checkUser(service_id).then(function(userCheckResponse) {
        

          console.log(JSON.stringify(userCheckResponse));
          userArray.push(userCheckResponse);
          console.log(JSON.stringify(userArray))

          // logic to check if user is found before proceeding
          if (!userArray[0][1].checkUserPassed) {
            return
          }
          console.log('userID:  ' + userArray[0][0][0].user_id)
          checkPlusOne(userArray[0][0][0].user_id).then(function(plusOneCheck) {
            
            console.log(JSON.stringify(plusOneCheck));
            


            if ( args[0] == "verify") {

              console.log("uuid:\t" + uuid.slice(2, -1) + "\nplusone_admin:\t" + config.plusone.plusone_admin + "\nbot admin\t" + config.discord.bot_admin)
              // is user authorized
              if (uuid.slice(2, -1) == config.plusone.plusone_admin || uuid.slice(2, -1) == config.discord.bot_admin ) {
                // is a dm?
                if ( message.channel.type != 'dm') {
                  oneErrorMessage({ error: 'Not a DM!', description: '<@' + message.author + '>, The verify command can only be run from a DM!' });
                  return;
                }
                console.log("Verify called!")
                return;
              }
              else {
                oneErrorMessage({ error: 'Not Authorized!', description: '<@' + message.author + '>, You are not authorized for this command!' });
                console.log("Not Auth")
                return;
              }
      
              // send message to request list and wait fro the list to be sent (csv)

              // Using this list, hash the salt and see if it matches something in the DB, 

              // if so return the users data in a csv
//              return;
            }
            if (plusOneCheck.plusone_found === "true") {
              // User is found in the table and has been paid previously

              if (args[0] == "key" || args[0] == "Key" || args[0] == "onekey") {
                // regenerate a key and send the details

                return;
              }

              oneErrorMessage({ error: 'User Received One QRL Previously', description: '<@' + message.author + '>, you have signed up and received your payout already, one per user.' });
              const embed = new Discord.MessageEmbed()
                .setColor(0x000000)
                .setTitle('Plus One Information')
                .setDescription('Details from your Plus One signup.')
                .addField('Signed up date:', `\`${plusOneCheck.time_stamp}\``, false)
                .setFooter('  .: Tipbot provided by The QRL Contributors :.');
              message.author.send({ embed })
                .catch(error => {
                  errorMessage({ error: 'Direct Message Disabled...', description: 'It seems you have DM\'s blocked, please enable and try again...' });
                  if (error) return error;
                });
            }
            else {
              // User not found in table, add them and pay out

              plusOneHelper.InsertPlusOne({service: "discord", user_id: userArray[0][0][0].user_id, one_key: '', one_amt: 1 })

              oneMessage('One QRL, One Community!!\nYou have signed up, One QRL is on the way!');
              // oneMessage({ source: 'https://oneqrl.otd.to/community/', title: 'OneQRL', message: 'Little things we do, make us what we are. One QRL is on the way to your tipbot account. Thanks for signing up!' }, footer...);
              message.react(emojiCharacters.o)
                .then(() => message.react(emojiCharacters.n))
                .then(() => message.react(emojiCharacters.e))
                .then(() => message.react(emojiCharacters.q))
                .then(() => message.react(emojiCharacters.r))
                .then(() => message.react(emojiCharacters.l))
              .catch(() => console.error('One of the emojis failed to react.'));
            }

          });
        });
      });

  },
};
