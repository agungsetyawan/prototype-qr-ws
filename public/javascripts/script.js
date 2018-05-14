<script>
  // make connection
  // var socket = io.connect('http://localhost:3000');
  var socket = io();

  //listen for events
  socket.on("chat", addChat);

  $(function() {
    getChats()
    $("#send").click(function() {
      var chat = {
        name: $("#txtName").val(),
        chat: $("#txtMessage").val()
      }
      postChat(chat)
      // emit events
      socket.emit("chat", chat);
    })
  })

  function postChat(chat) {
    $.post("http://localhost:3000/chats", chat)
  }

  function getChats() {
    $.get("/chats", function(chats) {
      chats.forEach(addChat)
    })
  }

  function addChat(chatObj) {
    $("#messages").append(`<h5>${chatObj.name} </h5><p>${chatObj.chat}</p>`);
  }
</script>
