document.addEventListener('DOMContentLoaded', () => {
    const startCallButton = document.getElementById('start-call');
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');

    let localStream;
    let peerConnection;

    const iceConfiguration = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    };

    startCallButton.addEventListener('click', async () => {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        peerConnection = new RTCPeerConnection(iceConfiguration);

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                // Send the candidate to the remote peer
                sendSignal('candidate', event.candidate);
            }
        };

        peerConnection.ontrack = event => {
            remoteVideo.srcObject = event.streams[0];
        };

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        sendSignal('offer', offer);
    });

    function sendSignal(type, data) {
        // Use your backend to send the signal to the remote peer
        fetch('/study_groups/signal/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ type, data })
        });
    }

    async function handleSignal(signal) {
        if (signal.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            sendSignal('answer', answer);
        } else if (signal.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data));
        } else if (signal.type === 'candidate') {
            await peerConnection.addIceCandidate(new RTCIceCandidate(signal.data));
        }
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // WebSocket or other method to receive signals from the server
    const socket = new WebSocket('wss://yourserver.com/ws/study_groups/');
    socket.onmessage = async (event) => {
        const signal = JSON.parse(event.data);
        await handleSignal(signal);
    };
});

