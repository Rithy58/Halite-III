<template>
    <div class="home-container">
        <div class="personal-msg" v-if="user">
            <div class="left-container" v-if="user.rank">
                <div class="top-bg"></div>
                <div class="title">Hi, {{ user.username }}! </div>
                <div class="text-tips" v-if="user.team_name">
                    Keep up the good work. Your team's bot is ranked #{{ user.rank }}.<br/>
                </div>
                <div class="text-tips" v-else>
                    Keep up the good work. Your bot is ranked #{{ user.rank }}.<br/>
                </div>
                <a class="btn btn-primary btn-sm" href="/play-programming-challenge/">Keep playing</a>
            </div>
            <div class="left-container" v-else>
                <div class="top-bg"></div>
                <div class="title">Hi, {{ user.username }}! </div>
                <div class="text-tips">
                    Submit your first bot to get on the leaderboard.<br/>
                    Choose your language to start building:
                </div>
                <a
                  v-if="has_bots"
                  class="btn btn-primary btn-sm"
                  href="/learn-programming-challenge/">Play now</a>
                <div v-else class="submit-bot">
                  <v-select
                    placeholder="Choose bot language"
                    v-model="bot_language"
                    :options="['Python3', 'JavaScript', 'Java', 'C++', 'Other']">
                  </v-select>

                  <a class="btn btn-primary btn-sm" @click="submit_bot">Submit Bot</a>
                </div>
            </div>
            <div class="right-container">
                <div class="data-item">
                    <div class="item-icon"></div>
                    <div class="item-info">
                        <div class="item-title">Your Bot Version</div>
                        <div class="item-data">{{ user.num_submissions || "N/A" }}</div>
                    </div>
                </div>
                <div class="data-item">
                    <div class="item-icon"></div>
                    <div class="item-info" v-if="user.team_name">
                        <div class="item-title">{{ user.team_name }}'s Global Rank</div>
                        <div class="item-data">#{{ user.rank || "N/A" }}</div>
                    </div>
                    <div class="item-info" v-else>
                        <div class="item-title">Your Global Rank</div>
                        <div class="item-data">#{{ user.rank || "N/A" }}</div>
                    </div>
                </div>
                <div class="data-item" v-if="organization_rank">
                    <div class="item-icon"></div>
                    <div class="item-info">
                        <div class="item-title">{{ user.organization }}'s Global Rank</div>
                        <div class="item-data">#{{organization_rank.organization_rank}}</div>
                    </div>
                </div>
                <div class="data-item" v-else>
                    <div class="item-icon"></div>
                    <div class="item-info">
                        <div class="item-title">Organization Rank</div>
                        <div class="item-data">#N/A</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row section-overview">
            <div class="col-md-6">
                <img src="/assets/images/sample_game.png" alt="Game map" style="max-width:80%;margin:auto;display:block;">
            </div>
            <div class="col-md-6">
                <h1>AI AI, Captain</h1>
                <p>Halite is an open source artificial intelligence challenge, created by Two Sigma.</p>
                <p>Halite III is a resource management game. Your goal is to build a bot that efficiently navigates the seas collecting halite, a luminous energy resource.</p>
                <br>
                <a class="btn btn-primary" href="/learn-programming-challenge/">Play now</a>
            </div>
        </div>
        <div class="row section-overview">
            <div class="col-md-12" style="width:66.66%;margin:auto;text-align:center;">
                <h2>Finals run through January 29</h2>
                <p>The Halite III challenge submission period has closed. Thank you to the thousands of participants from over 100 countries who built a Halite bot in one of more than 20 programming languages. The Halite servers ran more than 4 million games over the course of the regular season.</p>
                <p>The finals period runs through January 29, 2019. Stay tuned for the results!</p>
                <br>
                <a class="btn btn-primary btn-sm" href="/play-programming-challenge" style="color:#fff;background-image:linear-gradient(0deg, #0073DB 0%, #0044A4 100%);">Learn more</a>
            </div>
        </div>
        <div class="row section-feed">
            <div class="col-md-6">
                <div class="feed-block">
                    <div class="feed-header">
                        <h2>Competition Updates</h2>
                    </div>
                     <a data-height="500px" class="twitter-timeline" href="https://twitter.com/HaliteAI"></a>
                </div>
            </div>
            <div class="col-md-6">
                <div class="partner-block" style="text-align:center;">
                    <div class="feed-header">
                        <h2>About Two Sigma</h2>
                    </div>
                    <div class="partner-main">
                        <div class="logo">
                            <img src="/assets/images/logo-two-sigma.png" alt="two sigma">
                        </div>
                    </div>
                    <br>
                    <p>Two Sigma is an investment manager applying technology and data science to discover value in the world’s data. Each Halite season, Two Sigma looks forward to meeting participants with creative and successful Halite bots.</p>
                    <p> Learn more about careers at Two Sigma <a href="https://www.twosigma.com/careers" onclick="javascript:handleOutboundLinkClicks('click-external', 'click-ts','careers');return true;">here</a>.</p>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
  import Vue from 'vue'
  import * as api from '../api'
  import * as utils from '../utils'
  import ChallengeModal from './ChallengeModal.vue'
  import vSelect from 'vue-select'

  export default {
     name: 'home',
     props: ['baseUrl'],
     components: {ChallengeModal,vSelect},
     data: function () {
        const me = api.me_cached()
        let me_in = false
        if (me) {
          return {
            me_in: true,
            modalOpen: false,
            user: null,
            organization_rank: null,
            bot_language: 'Python3',
            has_bots: true,
          }
        }
       return {
         me_in,
         modalOpen: false,
         organization_rank: null,
         bot_language: null,
         has_bots: true,
       }
    },
    mounted() {
      this.fetchUserInfo()
    },
     methods: {
       submit_bot() {
         api.submitNewUserBot(this.user.user_id, this.bot_language).then((created) => {
           if (created) {
             window.location = '/editor'
           }
           else {
             window.location = '/learn-programming-challenge/downloads'
           }
         });
       },
       invite: function () {
         this.gaData('invite', 'click-to-invite', 'home')
         if (!document.getElementById('intmpid').checkValidity()) {
           document.getElementById('invitestatus').style.color = 'red'
           document.getElementById('invitestatus').textContent = 'Invalid email..'
           this.gaData('invite-error', 'click-to-invite', 'home')
         } else {
           let content = document.getElementById('intmpid').value
           api.invite_friend(content).then(status => {
             document.getElementById('invitestatus').style.color = 'green'
             document.getElementById('invitestatus').textContent = 'Invitation sent...'
             this.gaData('invite-success', 'click-to-invite', 'home')
           })
         }
       },
       gaData: function (category, action, label) {
         utils.gaEvent(category, action, label)
       },
       openChallengeModal: function(){
        this.modalOpen = true
       },
       closeChallengeModal: function(){
        this.modalOpen = false;
       },
       // Get user information
       fetchUserInfo: function() {
         api.me().then((user) => {
           if (user) {
             this.user = user

             api.list_bots(user.user_id).then((bots) => {
               this.has_bots = bots.length > 0;
             });

             if (user.organization_id === null) {
               this.organization_rank = null
               return
             }
             const filter = [`organization_id,=,${user.organization_id}`]
             api.organizationLeaderboard(filter).then((org) => {
               if (org && org.length > 0)
                 this.organization_rank = org[0]
             })
           }
         })
       },
     }
   }
</script>

<style lang="scss" scoped>
    .btn.btn-primary {
        &:after {
            content: "";
            display: inline-block;
            margin-left: 10px;
            width: 12px;
            height: 18px;
            background: url("/assets/images/icons/pixelate-arrow.png") center center no-repeat;
            background-size: cover;
        }
    }


    .submit-bot {
      display: flex;
      width: 100%;
      align-items: baseline;

      .dropdown {
        flex: 1;
        min-width: 10em;
      }
    }
</style>
