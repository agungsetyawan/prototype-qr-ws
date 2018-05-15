<script>
  var socket = io.connect();
  var socketID;
  var data = {};
  var firstInit = true;
  socket.on('connect', function() {
    socketID = socket.id;
  });
  socket.on('qr', function(message) {
    console.log(message);
    if (firstInit === true) {
      print(message);
      firstInit = false;
    } else {
      $('#printQR').html('<center>Terima Kasih<center>');
      var a = setInterval(function() {
        print(message);
        clearInterval(a);
      }, 5000);
    }
  });

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
