<script>
  var socket = io.connect();
  var socketID;
  socket.on('connect', function() {
    socketID = socket.id;
  });
  // socket.on("chat", addChat)

  $(function() {
    getChats(socketID)
  })

  function getChats(socketID) {
    $.get("test/qr/"+socketID, function(qr) {
      qr.forEach(print)
    })
  }

  function print(qrObj) {
    $("#printQR").append(`${qrObj.qr}`);
  }
</script>
