<script>
  var socket = io.connect();
  var socketID;
  var firstInit = true;
  var geometry = {
    lat: 0,
    long: 0
  }
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

  var host = window.location.href == 'https://protype.space' ? 'https://protype.space' : 'https://prototypez.herokuapp.com';

  function print(data) {
    $('h1.display-4.text-center').html('Scan QR');
    $("#printQR").removeClass('d-none');
    $("#printQR").empty();
    var interval = setInterval(function() {
      if ((geometry.lat != 0) && (geometry.long != 0)) {
        var link = host + '/qr/' + data.uniqid + '?lat=' + geometry.lat + '&long=' + geometry.long;
        // var svg_string = qr.imageSync(link, {
        //   type: 'svg'
        // });
        $('#printQR').qrcode(link);
        clearInterval(interval);
      }
    }, 1000);
  }

  if (navigator.geolocation) {
    var id = navigator.geolocation.watchPosition(success, error);
    var options = {
      enableHighAccuracy: false,
      timeout: 500000,
      maximumAge: 0
    };

    function success(pos) {
      var crd = pos.coords;
      console.log(crd);
      geometry.lat = crd.latitude;
      geometry.long = crd.longitude;
      navigator.geolocation.clearWatch(id);
    }

    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    }
  } else {
    console.log('not support');
  }
</script>
