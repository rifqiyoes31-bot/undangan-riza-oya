
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, query, orderByKey, limitToLast, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDOEQrjdhjt5n56rOOlakR3NO_tLre_eyI",
    authDomain: "undangan-c2f04.firebaseapp.com",
    projectId: "undangan-c2f04",
    storageBucket: "undangan-c2f04.firebasestorage.app",
    messagingSenderId: "179023122325",
    appId: "1:179023122325:web:02efdbff9ebb08294f309c",
    measurementId: "G-FH7SVB41Q4",
    databaseURL: "https://undangan-c2f04-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const commentsRef = ref(db, "comments");

export const firebaseComment = {
    init: () => {
        const commentsContainer = document.getElementById('comments');
        if (!commentsContainer) return;

        // Tampilkan loading sebentar
        commentsContainer.innerHTML = '<div class="text-center p-3"><div class="spinner-border spinner-border-sm text-primary" role="status"></div> Loading komentar...</div>';

        // Listen data secara Realtime (mengambil 100 komentar terbaru)
        const q = query(commentsRef, orderByKey(), limitToLast(100));

        onValue(q, (snapshot) => {
            commentsContainer.innerHTML = "";
            const data = snapshot.val();

            if (!data) {
                commentsContainer.innerHTML = '<div class="text-center p-4 bg-theme-auto rounded-4 shadow"><p class="p-0 m-0">Belum ada ucapan. Jadilah yang pertama! 🎉</p></div>';
                return;
            }

            // Realtime DB data is an object, convert to array and reverse for newest first
            const entries = Object.entries(data).reverse();

            entries.forEach(([key, val]) => {
                const card = document.createElement('div');
                card.className = 'p-3 mb-3 bg-theme-auto rounded-4 shadow-sm border-start border-4 ' + (val.presence === '1' ? 'border-success' : 'border-danger');

                const time = val.timestamp ? new Date(val.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Baru saja';

                card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="fw-bold m-0 text-primary">${val.name}</h6>
                        <small class="text-muted" style="font-size: 0.7rem;">${time}</small>
                    </div>
                    <div class="mb-2" style="font-size: 0.9rem;">
                        <span class="badge ${val.presence === '1' ? 'bg-success' : 'bg-danger'} mb-2">
                            ${val.presence === '1' ? '✓ Datang' : '✗ Berhalangan'}
                        </span>
                        <p class="m-0 text-break">${val.comment}</p>
                    </div>
                `;
                commentsContainer.appendChild(card);
            });
        });

        // Pasang event klik pada tombol Send
        const sendBtn = document.querySelector('button[onclick="undangan.comment.send(this)"]');
        if (sendBtn) {
            sendBtn.removeAttribute('onclick');
            sendBtn.addEventListener('click', async (e) => {
                const nameInput = document.getElementById('form-name');
                const presenceInput = document.getElementById('form-presence');
                const commentInput = document.getElementById('form-comment');

                const name = nameInput.value.trim();
                const presence = presenceInput.value;
                const comment = commentInput.value.trim();

                if (!name || presence === "0" || !comment) {
                    alert("Harap isi nama, kehadiran, dan ucapan Anda.");
                    return;
                }

                sendBtn.disabled = true;
                sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Mengirim...';

                try {
                    const newCommentRef = push(commentsRef);
                    await set(newCommentRef, {
                        name: name,
                        presence: presence,
                        comment: comment,
                        timestamp: serverTimestamp()
                    });

                    commentInput.value = "";
                } catch (error) {
                    console.error("Error adding comment: ", error);
                    alert("Gagal mengirim ucapan. Pastikan Realtime Database sudah dalam 'Test Mode'.");
                } finally {
                    sendBtn.disabled = false;
                    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Send';
                }
            });
        }
    }
};
