(function () {
  // Rutina de Tomi, en el orden que definió la familia.
  // Para cambiarla, basta con editar este arreglo.
  var pasos = [
    { id: 'despertar', pic: '🛏️', texto: 'Me despierto' },
    { id: 'dientes',   pic: '🪥', texto: 'Me lavo los dientes' },
    { id: 'uniforme',  pic: '👕', texto: 'Me pongo el uniforme' },
    { id: 'desayuno',  pic: '🥣', texto: 'Desayuno' }
  ];

  var huecosEl = document.getElementById('huecos');
  var fichasEl = document.getElementById('fichas');
  var preguntaEl = document.getElementById('pregunta');
  var mensajeEl = document.getElementById('mensaje');
  var juegoEl = document.getElementById('juego');
  var finEl = document.getElementById('fin');

  var idx, errores, alPrimero, pistas, inicio;

  // Fisher-Yates: desordena sin que ningún orden sea más probable que otro
  function desordenar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function empezar() {
    idx = 0; errores = 0; alPrimero = 0; pistas = 0; inicio = null;
    huecosEl.innerHTML = ''; fichasEl.innerHTML = '';
    mensajeEl.textContent = '';
    preguntaEl.textContent = '¿Qué hace Tomi primero?';
    juegoEl.hidden = false; finEl.hidden = true;

    pasos.forEach(function (_, i) {
      var h = document.createElement('div');
      h.className = 'hueco';
      h.textContent = 'Paso ' + (i + 1);
      huecosEl.appendChild(h);
    });

    var orden = desordenar(pasos);
    // Evita que salga ya ordenado
    if (orden.every(function (p, i) { return p.id === pasos[i].id; })) orden.reverse();

    orden.forEach(function (paso) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ficha';
      b.dataset.id = paso.id;
      b.innerHTML = '<span class="pic" aria-hidden="true">' + paso.pic + '</span><span class="lbl">' + paso.texto + '</span>';
      b.addEventListener('click', function () { tocar(b, paso); });
      fichasEl.appendChild(b);
    });
  }

  function tocar(boton, paso) {
    if (!inicio) inicio = Date.now();
    var esperado = pasos[idx];

    if (paso.id === esperado.id) {
      if (errores === 0) alPrimero++;
      errores = 0;
      var hueco = huecosEl.children[idx];
      hueco.classList.add('lleno');
      hueco.innerHTML = '<span class="pic" aria-hidden="true">' + paso.pic + '</span>' + paso.texto;
      boton.classList.add('usada');
      boton.disabled = true;
      quitarPistas();
      idx++;
      if (idx === pasos.length) return terminar();
      mensajeEl.textContent = '¡Bien!';
      preguntaEl.textContent = '¿Y después?';
    } else {
      errores++;
      if (errores === 1) {
        mensajeEl.textContent = 'Casi. Piensa qué viene ' + (idx === 0 ? 'primero.' : 'después de “' + pasos[idx - 1].texto.toLowerCase() + '”.');
      } else {
        pistas++;
        mensajeEl.textContent = 'Te ayudo: busca el dibujo que brilla.';
        var correcta = fichasEl.querySelector('[data-id="' + esperado.id + '"]');
        if (correcta) correcta.classList.add('pista');
      }
    }
  }

  function quitarPistas() {
    fichasEl.querySelectorAll('.pista').forEach(function (f) { f.classList.remove('pista'); });
  }

  function terminar() {
    var seg = Math.round((Date.now() - inicio) / 1000);
    document.getElementById('dTiempo').textContent = Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0');
    document.getElementById('dPrimera').textContent = alPrimero + '/' + pasos.length;
    document.getElementById('dPistas').textContent = pistas;
    juegoEl.hidden = true; finEl.hidden = false;
  }

  document.getElementById('reiniciar').addEventListener('click', empezar);
  empezar();

    var URL_SCRIPT = 'https://script.google.com/macros/s/AKfycbyg-5-tS4ia6HzV3VXBGIJvi2sATIW9G8DZcc6UQcAs0xU9QHh4o3rJ8c3xjqE2CjlP/exec';

  var form = document.getElementById('interes');
  var aviso = document.getElementById('aviso');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    aviso.textContent = 'Enviando…';

    var datos = {
      nombre: form.nombre.value,
      rol: form.rol.value,
      correo: form.correo.value,
      consentimiento: form.consentimiento.checked
    };

    try {
      var r = await fetch(URL_SCRIPT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(datos)
      });
      var res = await r.json();
      if (res.ok) {
        aviso.textContent = '¡Gracias! Te escribiremos pronto.';
        form.reset();
      } else {
        aviso.textContent = 'Revisa que todos los campos estén completos.';
      }
    } catch (err) {
      aviso.textContent = 'No pudimos enviar tus datos. Revisa tu conexión e inténtalo otra vez.';
    } finally {
      boton.disabled = false;
    }
  });
  });
})();
