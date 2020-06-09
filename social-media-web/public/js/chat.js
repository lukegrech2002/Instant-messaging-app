var server = "http://localhost:4000"
var io = io(server);

function sendMessage(){
    var message = document.getElementById("messagebox");
    io.emit("new_message", message.value);
    messagebox.innerHTML = "";
    return false;
}

$.ajax({
    url: server + "/get_messages",
    method: "GET",
    success: function (res){
        console.log(res);

        var messagechatbox = document.getElementById("div6");

        if(messagechatbox.value === ""){
            return;
        }else{}

        //Parsing JSON to JavaScript Object
        var data = JSON.parse(res);
        for(var messagesCount = 0; messagesCount < data.length; messagesCount++){
            var li = document.createElement("li");

            //Giving a unique ID
            li.id="message-" + data[messagesCount].message_id;
            li.innerHTML = '<strong>' + data[messagesCount].username + ': </strong>' + data[messagesCount].content;
            //Delete button
            li.innerHTML += "<button data-message_id='" + data[messagesCount].message_id + "' onclick='deleteMessage(this);'>Delete</button>";
            messagechatbox.appendChild(li);
        }
    }
});

function deleteMessage(self){
    //Get Message ID
    var message_id = self.getAttribute("data-message_id");
    
    //Send deletion to server
    io.emit("delete_message", message_id);
}

io.on("delete_message", function (message_id){
    //Getting message node by message ID
    var deletableMessage = document.getElementById("message-" + message_id);
    deletableMessage.innerHTML = "<i>This message has been removed<i>";
});

io.on("new_message", function(data){
    var messageBox = document.getElementById("messagebox");

    console.log("Server says", data);
    var li = document.createElement("li");
    
    li.id="message-" + data.message_id;
    
    //Adding the message content and the username
    li.innerHTML = '<strong>' + data.user + '</strong>: ' + data.message;

    //Creating delete button for each message
    li.innerHTML+= "<button data-message_id='" + data.message_id + "' onclick='deleteMessage(this);'>Delete</button>";

    var messagechatbox = document.getElementById("div6");
    messagechatbox.appendChild(li);
    
    //Clearing input field
    messageBox.value = "";
});

