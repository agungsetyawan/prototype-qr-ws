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

  // var host = 'https://prototypez.herokuapp.com'; // herokuapp
  // var host = 'http://192.168.100.18:3000'; // mirum bandung
  var host = 'http://192.168.43.19:3000'; // redmi 4x

  function print(data) {
    $('h1.display-4.text-center').html('Scan QR');
    $("#printQR").removeClass('d-none');
    // $("#printQR").html(`${data.qr}`);
    var link = host + '/qr/' + data.uniqid;
    // var svg_string = qr.imageSync(link, {
    //   type: 'svg'
    // });
    $('#printQR').qrcode(link);
  }

  if (navigator.geolocation) {
    // navigator.geolocation.getCurrentPosition(function(position) {
    //   var pos = {
    //     lat: position.coords.latitude,
    //     lng: position.coords.longitude
    //   };
    //   console.log(position);
    //   console.log(pos);
    // }, function() {
    //   console.log('err')
    //   // handleLocationError(true, infoWindow, map.getCenter());
    // });
    var id, target, options;

    function success(pos) {
      var crd = pos.coords;
      console.log(crd);
      console.log(crd.latitude);
      console.log(crd.longitude);

      if (target.latitude === crd.latitude && target.longitude === crd.longitude) {
        console.log('Congratulations, you reached the target');
        navigator.geolocation.clearWatch(id);
      }
    }

    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    }

    target = {
      latitude: 0,
      longitude: 0
    };

    options = {
      enableHighAccuracy: false,
      timeout: 500000,
      maximumAge: 0
    };

    id = navigator.geolocation.watchPosition(success, error);
  } else {
    // Browser doesn't support Geolocation
    console.log('not support')
    // handleLocationError(false, infoWindow, map.getCenter());
  }
</script>
