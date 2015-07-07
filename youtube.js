
VideoDB = new Mongo.Collection('videos');


if(Meteor.isClient){
    // All Helpers
    var myplayer;
    shallIplayVideo = function (){
        var uniqueURL = Session.get('watching');

        var videoInfo = VideoDB.findOne({
            uniqueURL: uniqueURL
        });
        console.log();
        if(videoInfo){
            if(videoInfo.adminPlayed == 1 && Session.get('playerLoaded')){
                console.log("Yeah, he clicked it.");
                //$("#checkReady").trigger( "click" );
                event.target.playVideo();
                //myplayer.playVideo();
                return "yeah";
            }
        }
    }
    LoadVideo = function (url){
        // YouTube API will call onYouTubeIframeAPIReady() when API ready.
        // Make sure it's a global variable.
        onYouTubeIframeAPIReady = function () {

            // New Video Player, the first argument is the id of the div.
            // Make sure it's a global variable.
            myplayer = new YT.Player("ytplayer", {

                height: "400",
                width: "600",

                videoId: url,

                // Events like ready, state change,
                events: {

                    onReady: function (event) {
                        // Play video when player ready.
                        //event.target.playVideo();
                        Session.set('playerLoaded', true);
                        console.log(event);

                        var i = 0;
                        (function theLoop (i) {
                            setTimeout(function () {
                                //alert("Cheese!");
                                // DO SOMETHING WITH data AND stuff
                                var uniqueURL = Session.get('watching');
                                console.log("checking....");
                                var videoInfo = VideoDB.findOne({
                                    uniqueURL: uniqueURL
                                });

                                if(videoInfo){
                                    if(videoInfo.adminPlayed == 1 && Session.get('playerLoaded')){
                                        event.target.playVideo();
                                    }
                                }
                                if (--i) {                  // If i > 0, keep going
                                    theLoop(i);  // Call the loop again
                                }
                            }, 500);
                        })(i);


                        while(2==1){
                        //setTimeout(function () {    //  call a 3s setTimeout when the loop is called
                            //alert('hello');          //  your code here
                            var uniqueURL = Session.get('watching');
                            console.log("checking....");
                            var videoInfo = VideoDB.findOne({
                                uniqueURL: uniqueURL
                            });

                            if(videoInfo){
                                if(videoInfo.adminPlayed == 1 && Session.get('playerLoaded')){
                                    event.target.playVideo();
                                }
                            }
                        }
                        //setInterval(shallIplayVideo, 10);
                        //console.log("player loaded");
                    }
                }
            });
        };
        YT.load();
    }
    Template.player.helpers({
        'checkAdminPlayed': function(){
            var uniqueURL = Session.get('watching');

            var videoInfo = VideoDB.findOne({
                uniqueURL: uniqueURL
            });
            console.log();
            if(videoInfo){
                if(videoInfo.adminPlayed == 1 && Session.get('playerLoaded')){
                    console.log("Yeah, he clicked it.");
                    $("#checkReady").trigger( "click" );
                    //return "yeah";
                    //myplayer.playVideo();
                    return "yeah";
                }
            }
        },
        'checkEveryoneReady': function(){
            var uniqueURL = Session.get('watching');

            var videoInfo = VideoDB.findOne({
                uniqueURL: uniqueURL
            });

            var joined = 0;
            var ready = 0;

            if(videoInfo){
                if(videoInfo.connected.length > 1){
                    for (var i = 0, len = videoInfo.connected.length; i < len; i++) {
                        if(videoInfo.connected[i].ready == 'yes'){
                            ready++;
                            joined++;
                        }else{
                            joined++;
                        }
                    }
                    if( joined == ready ){
                        VideoDB.update({_id: videoInfo._id}, {$set: {status: "Everyone is ready. Waiting for admin to click PLAY :)"}});
                    }else{
                        VideoDB.update({_id: videoInfo._id}, {$set: {status: "Everyone is not ready yet."}});
                    }
                    return "joined "+joined+" | ready "+ready+".";

                }else{
                    VideoDB.update({_id: videoInfo._id}, {$set: {status: "No one connected yet."}});
                }
            }
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
            //return Session.get('playerStatus') || 'waiting';
        },
        'OnlineHelper': function(){
            return Session.get('OnlineError') || "";
        }
        //'userNameHelper': function(){
        //    var uniqueURL = Session.get('watching');
        //
        //    var videoInfo = VideoDB.findOne({
        //        uniqueURL: uniqueURL
        //    });
        //    if(videoInfo){
        //        for (var i = 0, len = videoInfo.connected.length; i < len; i++) {
        //
        //        }
        //    }
        //
        //    return Spacebars.SafeString("<input id=\""+Session.get('userName')+"\" class=\"ready\" type=\"submit\" value=\"READY!\">");
        //}

    });

    Template.player.events({
        'click #checkReady': function( event ){
            console.log("clicked me");
            var uniqueURL = Session.get('watching');

            var videoInfo = VideoDB.findOne({
                uniqueURL: uniqueURL
            });
            console.log();
            if(videoInfo){
                if(videoInfo.adminPlayed == 1){
                    console.log("Yeah, he clicked it.");
                    //return "yeah";
                    //myplayer.playVideo();
                    return "yeah";
                }
            }
        },
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

                if(FriendName.toString() == getVideo.createdBy){
                    console.log("owner clicked");
                    VideoDB.update({_id: getVideo._id}, {$set: {adminPlayed: 1}});
                    //myplayer.playVideo();
                }

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
                connected: [{name: name.toString(), ready: 'yes'}],
                ready: [],
                adminPlayed: 0
            });

            Router.go('/watch/'+uniqueURL);

            LoadVideo(videoURL);
        }
    });

    // All Methods
    Meteor.methods({

    });





    // Routes
    Router.route('/watch/:uniqueURL', function () {
        // HOUSEKEEPING
        Session.set('OnlineError', '');
        console.log("yeah, i got to here.");

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
        console.log("yeah, i got to here too.");

    });

    Router.route('/', function () {
        //document.body.innerHTML = '';
        this.render('index');
    })
    // Routes End
}

if(Meteor.isServer) {

}