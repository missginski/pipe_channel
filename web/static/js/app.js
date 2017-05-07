import "phoenix_html"
import {Socket,Presence} from "phoenix"
import $ from "jquery"
let user;
let socket;
let presence = {}
let date;
let userlist;
let room;
let messageInput;
let messagelist;
let chat;
let widgetIframe;
let widget;
let userSearchInput;
let backgrounds = {
  hiphop : "https://images.unsplash.com/photo-1473247432547-8dad9b3c2d61?dpr=1&auto=format&fit=crop&w=1199&h=799&q=80&cs=tinysrgb&crop=&bg=",
  rock: "https://images.unsplash.com/photo-1481886756534-97af88ccb438?dpr=1&auto=format&fit=crop&w=1199&h=674&q=80&cs=tinysrgb&crop=&bg=",
  reggae: "https://images.unsplash.com/photo-1488792297347-0bc068dcaaef?dpr=1&auto=format&fit=crop&w=1199&h=799&q=80&cs=tinysrgb&crop=&bg=",
  house: "https://images.unsplash.com/photo-1431538404774-80dc4ae8c56e?dpr=1&auto=format&fit=crop&w=1199&h=899&q=80&cs=tinysrgb&crop=&bg="
}
let rockArrPlayllist = ["https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/301080731","https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/151673651","https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/166373421"];
let hiphopArrPlaylist = ["https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/121610443","https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/117265791","https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/144919148"];
let reggaeArrPlaylist = ["https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/182509432","https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/3390956","https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/83035406"];
let houseArrPlaylist = ["https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/104226047","https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/187820200","https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/63243864"];
$(function() {

  user = document.getElementById('user').innerText;
  userlist = document.getElementById('userlist');
  messageInput = document.getElementById("newMessage");
  messagelist = document.getElementById("messagelist");
  chat = document.getElementById('chatx');
  widgetIframe = document.getElementById('sc-widget');

  socket = new Socket("/socket", {params: {user: user}})
    socket.connect()


  function formatedTimestamp(Ts){
    date = new Date(Ts);
    return date.toLocaleString();
  }
  function listBy(user, {metas: metas}){
    return {
      user: user,
      onlineAt: formatedTimestamp(metas[0].online_at)
    }
  }
  function render(presences){
    userlist.innerHTML = Presence.list(presences, listBy)
    .map(presence => `
      <li>
        <strong>${presence.user}</strong>
        <br>
          online at: ${presence.onlineAt}
        </li>
        `).join("")
  }

  room = socket.channel("room:lobby");

  room.on("presence_state",function(state){
      presence = Presence.syncState(presence,state)
      render(presence)
  });
  room.on("presence_diff", function(diff){
      presence = Presence.syncDiff(presence, diff)
      render(presence)
  });

  room.join()

  chat.addEventListener("submit",function(e){
    e.preventDefault();
    room.push("message:new",messageInput.value);
    console.log(messageInput.value)
  })

  room.on("message:new",function(message,diff){
    // renderMessage(message);
  //  presence = Presence.syncDiff(presence,diff)
    console.log(message)
    let listitem = document.createElement('li')
    listitem.innerHTML = "<strong>" + message.user + "</strong>" + " said: " + message.body
    messagelist.appendChild(listitem)
  })
  //Soundcloud Api Widget
  function sound_cloud(){
      widget = SC.Widget(widgetIframe);

      widget.bind(SC.Widget.Events.READY, function() {

          widget.bind(SC.Widget.Events.PLAY, function() {
                /* get information about currently playing sound */
                widget.getCurrentSound(function(currentSound) {
                  console.log('sound ' + currentSound.get('') + 'began to play');
                }); //end of widget.getCurrentSound
          }); //end of widget.bind(widget events play)


          // get current level of volume
          widget.getVolume(function(volume) {
            console.log('current volume value is ' + volume);
          });

          widget.setVolume(50); // get the value of the current position

      }) //end of widget.bind widget events.ready

   };
   sound_cloud();

   $("#submitPlist").click(function(e){
       e.preventDefault();
       userSearchInput = $('#search').val();
       console.log(userSearchInput);
       room.push("genre:new",userSearchInput);
   });
   room.on("genre:new",function(genre){
     userSearchInput = genre.body
     console.log(userSearchInput + 'foo')
     selectPlaylist(userSearchInput);
   })



   function selectPlaylist() {
      if(userSearchInput==="rock") {
        let randRockPlaylist = rockArrPlayllist[Math.floor(Math.random() * rockArrPlayllist.length)];
        $("#sc-widget").attr("src", randRockPlaylist);
        $('body').css('background',`url(${backgrounds.rock})`);
      } else if (userSearchInput==="hip-hop") {
        let randHiphopPlaylist = hiphopArrPlaylist[Math.floor(Math.random() * hiphopArrPlaylist.length)];
        $("#sc-widget").attr("src", randHiphopPlaylist);
        $('body').css('background',`url(${backgrounds.hiphop})`);
      } else if (userSearchInput==="reggae") {
        let randReggaePlaylist = reggaeArrPlaylist[Math.floor(Math.random() * reggaeArrPlaylist.length)];
        $("#sc-widget").attr("src", randReggaePlaylist);
        $('body').css('background',`url(${backgrounds.reggae})`);
      }//end of elseif
       else if (userSearchInput==="house") {
        let randHousePlaylist = houseArrPlaylist[Math.floor(Math.random() * houseArrPlaylist.length)];
        $("#sc-widget").attr("src", randHousePlaylist);
        $('body').css('background',`url(${backgrounds.house})`);
      } //end of elseif
       else {
        alert("Please enter one of the listed above music genres and try again!")
      }//end of else
   }//end of selectPlaylist function
});
