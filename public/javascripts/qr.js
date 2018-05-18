<script>
  var socket = io.connect();
  var socketID;
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
      $('h1.display-4.text-center').html('Terima Kasih');
      $('#printQR').addClass('d-none');
      var a = setInterval(function() {
        print(message);
        clearInterval(a);
      }, 5000);
    }
  });

  function print(qrObj) {
    $('h1.display-4.text-center').html('Scan QR');
    $("#printQR").removeClass('d-none');
    $("#printQR").html(`${qrObj.qr}`);
  }
</script>
