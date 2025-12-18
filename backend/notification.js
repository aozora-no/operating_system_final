// backend/notification.js
(function () {
    let notification = null;
    let container = null;
    let visible = false;
    const queue = [];

    function ensureContainer() {
        if (!container) {
            container = document.querySelector('.notification-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'notification-container';
                document.body.appendChild(container);
            }
        }
    }

    function createNotification() {
        notification = document.createElement('div');
        const btn = document.createElement('button');
        const title = document.createElement('div');
        const msg = document.createElement('div');

        btn.className = 'notification-close';
        btn.innerHTML = '&times;';
        title.className = 'notification-title';
        msg.className = 'notification-message';

        btn.addEventListener('click', hideNotification, false);
        notification.addEventListener('animationend', hideNotification, false);
        notification.addEventListener('webkitAnimationEnd', hideNotification, false);

        notification.appendChild(btn);
        notification.appendChild(title);
        notification.appendChild(msg);
    }

    function updateNotification(type, title, message) {
        notification.className = 'notification notification-' + type;
        notification.querySelector('.notification-title').innerHTML = title;
        notification.querySelector('.notification-message').innerHTML = message;
    }

    function showNotification(type, title, message) {
        ensureContainer();

        if (visible) {
            queue.push([type, title, message]);
            return;
        }

        if (!notification) createNotification();

        updateNotification(type, title, message);
        container.appendChild(notification);
        visible = true;
    }

    function hideNotification() {
        if (!visible) return;

        visible = false;
        if (notification && container.contains(notification)) {
            container.removeChild(notification);
        }

        if (queue.length > 0) {
            const next = queue.shift();
            showNotification.apply(null, next);
        }
    }

    // Expose globally so other pages can call it
    window.showNotification = showNotification;
})();
