import { guest } from './app/guest/guest.js';
import { firebaseComment } from './app/components/firebase-comment.js';

((w) => {
    w.undangan = guest.init();
    w.addEventListener('load', () => {
        firebaseComment.init();
    });
})(window);