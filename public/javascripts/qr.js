<script>
  var socket = io.connect();
  var socketID;
  socket.on('connect', function() {
    socketID = socket.id;
  });
  socket.on('qr', function(message) {
    console.log(message);
    print(message);
  })

  // function getQR(socketID) {
  //   $("#printQR").html('');
  //   $.get("test/qr/" + socketID, function(qr) {
  //     qr.forEach(print);
  //   });
  // }

  function print(qrObj) {
    $("#printQR").html(`${qrObj.qr}`);
  }
</script>
