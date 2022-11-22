module.exports = Object.freeze({
    ADMIN: 1,
    USER: 0,
    AZ: "az",
    EN: "ru",
    RU: "en",
    CASH: 1,
    CARD: 2,
    DRIVER: 1,
    PASSENGER: 2,
    BLOCK_COUNT: 6,
    SUCCESS: 1,
    ERROR: 2,
    WARNING: 3,
    UPDATE: 4,

    ACCEPT: 1,
    REJECT: 2,
    VERIFIED: 1,
    NOT_VERIFIED: 2,
    WAITING_FOR_VERIFICATION: 3,
    RIDE_WAITING: 1,
    PASSENGER_ORDER_WAITING: 1,
    PASSENGER_ORDER_ACCEPTED:2,
    PASSENGER_ORDER_DELETED:3,
    RIDE_IN_PROGRESS: 2,
    RIDE_FINISHED: 3,
    RIDE_DELETED: 4,
    SHOW_RATING_SERVICE: 1,
    NOTIFICATION_FROM_ADMIN_SERVICE: 2,
    SEND_MESSAGE: 'SEND_MESSAGE',
    ADD_USER: 'ADD_USER',
    DISCONNECT: 'disconnect',
    JOIN: 'JOIN',
    UNSUBSCRIBE: 'UNSUBSCRIBE',
    NEW_MESSAGE: 'NEW_MESSAGE',
    SEND_USER_STATUS: 'SEND_USER_STATUS',
    GET_USER_STATUS: 'GET_USER_STATUS',
    ADD_NEW_CONVERSATION: 'ADD_NEW_CONVERSATION',
    UPDATE_CONVERSATION: 'UPDATE_CONVERSATION',
    SEND_UPDATE_CONVERSATION: 'SEND_UPDATE_CONVERSATION',
    APP_PAUSED: 'APP_PAUSED',
    APP_RESUMED: 'APP_RESUMED',
    MARK_MESSAGE_AS_READ: 'MARK_MESSAGE_AS_READ',
    NEW_MESSAGE_NOTIFICATION: 'NEW_MESSAGE_NOTIFICATION',
    OFFLINE: 0,
    ONLINE: 1,
    ERROR_MESSAGE: 1,
    SIMPLE_MESSAGE: 2,
    HAVE_UNREAD_MESSAGE: 'HAVE_UNREAD_MESSAGE',
    COMMISSION: 8,
    FINE_FOR_DELETING_RIDE: 0.5,
    MAX_DEBT: 15,
    PAY: 'pay',
    CHECK: 'check',
    STATUS: 'status',
    FORGOT_PASSWORD_OTP: 0,
    SIGN_UP_OTP: 1
});