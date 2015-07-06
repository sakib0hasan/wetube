
VideoDB = new Mongo.Collection('videos');


if(Meteor.isClient){
    // All Helpers
    Template.player.helpers({
        'checkEveryoneReady': function(){
              
        },
        showGoButton: function(){
            var uniqueURL = Session.get('watching');

            var videoInfo = VideoDB.findOne({
                uniqueURL: uniqueURL
            });
            if(videoInfo){
                if(Session.get('userName') == videoInfo.createdBy || Session.get('GoClicked') == 'clicked'){
                    return false;
                }
            }
            return true;
        },
        showButton: function(){
            if(this.name == Session.get('userName')){
                return true;
            }else{
                return false;
            }
        },
        'HelperStatus': function(){
            return Session.get('playerStatus') || 'waiting';
        },
        'OnlineHelper': function(){
            return Session.get('OnlineError') || "";
        },
        'userNameHelper': function(){
            var uniqueURL = Session.get('watching');

            var videoInfo = VideoDB.findOne({
                uniqueURL: uniqueURL
            });
            if(videoInfo){

                //UserSession.set('watching', 'someone');
                console.log(videoInfo.connected);
                for (var i = 0, len = videoInfo.connected.length; i < len; i++) {

                    //console.log(videoInfo.connected[i]);
                }
            }

            return Spacebars.SafeString("<input id=\""+Session.get('userName')+"\" class=\"ready\" type=\"submit\" value=\"READY!\">");
        }

    });

    Template.player.events({
        'click .ready': function( event ){
            // READY BUTTON CLICKED

            event.preventDefault();
            console.log(Session.get('watching'));
            var getVideo = VideoDB.findOne({
                uniqueURL: Session.get('watching')
            });

            if(getVideo){
                var list = getVideo.connected;
                var FriendName = this.name;
                console.log(FriendName.toString());
                //readyList.push({name: FriendName.toString(), ready: 'yes'});
                for(var i = 0; i < list.length; i++){
                    if(list[i].name == FriendName){
                        list[i].ready = 'yes';
                    }
                }
                $("#"+FriendName).hide();

                VideoDB.update({_id: getVideo._id}, {$set: {connected: list}});
            }

        },
        'submit form': function(event){
            // GO BUTTON CLICKED

            event.preventDefault();
            var getVideo = VideoDB.findOne({
                uniqueURL: Session.get('watching')
            });

            if(getVideo){
                var list = getVideo.connected;
                var FriendName = event.target.FriendName.value;

                Session.set('userName', FriendName);

                for(var i = 0; i < list.length; i++){
                    if(list[i] == FriendName){
                        Session.set('OnlineError', 'Name already taken. Choose another one.');
                        return;
                    }
                }


                Session.set('OnlineError', '');
                list.push({name: FriendName.toString(), ready: 'nope'});

                VideoDB.update({_id: getVideo._id}, {$set: {connected: list}});
                Session.set('GoClicked', 'clicked');
                //console.log(getVideo);
            }
        }
    });


    // All events
    Template.index.events({
        'click #button': function(){
            Session.set('selectedPlayer', $('#url').val());
            //url = $('#url').val();
            //console.log(url);
        },
        'submit form': function(event){
            // INITIAL SUBMIT
            event.preventDefault();

            var regex = /[?&]([^=#]+)=([^&#]*)/g,
                url = event.target.url.value,
                params = {},
                match;
            while(match = regex.exec(url)) {
                params[match[1]] = match[2];
            }

            var uniqueURL = Math.random().toString(36).slice(2);
            var videoURL = params['v'];
            var name = event.target.name.value;

            Session.set('userName', name);

            VideoDB.insert({
                createdBy: name,
                createdAt: new Date(),
                youtubeURL: videoURL,
                uniqueURL: uniqueURL,
                status: 'Waiting',
                connected: [name],
                ready: []
            });

            Router.go('/watch/'+uniqueURL);
        }
    });

    // All Methods
    Meteor.methods({

    });

    LoadVideo = function (url){
        // YouTube API will call onYouTubeIframeAPIReady() when API ready.
        // Make sure it's a global variable.
        onYouTubeIframeAPIReady = function () {

            // New Video Player, the first argument is the id of the div.
            // Make sure it's a global variable.
            player = new YT.Player("player", {

                height: "400",
                width: "600",

                videoId: url,

                // Events like ready, state change,
                events: {

                    onReady: function (event) {

                        // Play video when player ready.
                        //event.target.playVideo();
                    }
                }
            });
        };
        YT.load();
    }


    // Routes
    Router.route('/watch/:uniqueURL', function () {
        // HOUSEKEEPING
        Session.set('OnlineError', '');


        var uniqueURL = this.params.uniqueURL;

        var videoInfo = VideoDB.findOne({
            uniqueURL: uniqueURL
        });
        Session.set('watching', uniqueURL);
        if(videoInfo){
            LoadVideo(videoInfo.youtubeURL);

            //UserSession.set('watching', 'someone');
            //console.log(UserSession.list());

            if(Session.get('watching')){

            }
        }

        this.render('player', {data: videoInfo});
        //console.log(Session.get('userName'));


    });

    Router.route('/', function () {
        //document.body.innerHTML = '';
        this.render('index');
    })
    // Routes End
}

if(Meteor.isServer) {

}