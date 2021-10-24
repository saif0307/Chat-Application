const socket = io();

const $form = document.getElementById("form-1")
const $locationButton = document.getElementById("send-location")
const $formButton = document.getElementById('form-button')
const $formInput = document.getElementById('form-input')
const $messages = document.getElementById('messages')
const $sidebar = document.getElementById('sidebar')



// Templates
const $messageTemplate = document.getElementById('message-template').innerHTML
const $locationTemplate = document.getElementById('location-template').innerHTML
const $sidebarTemplate = document.getElementById('sidebar-template').innerHTML
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// Auto Scroll function
const autoScroll = () => {
  // Getting the new Messages
  const $newMessage = $messages.lastElementChild
  //Height of new message
  const messageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(messageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  // Visible height
  const visibleHeight = $messages.offsetHeight
  // Total Height
  const totalHeight = $messages.scrollHeight

  const scrollOffset = $messages.scrollTop + visibleHeight

  if(totalHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }

}


$form.addEventListener("submit", (e) => {
  $formButton.setAttribute('disabled', 'disabled')
  e.preventDefault();
  socket.emit("message", e.target[0].value, (message) => {
    console.log(message);
    $formButton.removeAttribute('disabled')
    $formInput.value = ''
    $formInput.focus()
  });
});


socket.on('message', (message) => {
  console.log(message.createdAt)
  const html = Mustache.render($messageTemplate, {
    username:message.username,
    message: message.message,
    createdAt:moment(message.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()

})

socket.on('messagelocation', (message) => {
  const html = Mustache.render($locationTemplate, 
    { username:message.username,
      url:message.url,
    createdAt: moment(message.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users
  })
  $sidebar.innerHTML = html
})


$locationButton.addEventListener("click", () => {
  $locationButton.setAttribute('disabled', 'disabled')
  if (!navigator.geolocation) {
    alert("Browser doesnt support locations");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "location",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (messageLocation) => {
        console.log(messageLocation);
        $locationButton.removeAttribute('disabled')
      }
    );
  });
});

socket.emit('join', {username, room}, (error) => {
  alert(error)
  location.href = '/'
})