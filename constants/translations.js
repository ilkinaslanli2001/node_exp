const {MAX_DEBT} = require('../constants/constant')
module.exports = Object.freeze({
    add_passenger: {
        az: "rezerv etdi",
        ru: "зарезервировал поездку",
        en: "reserved the ride",
    },
    decline_ride: {
        az: "rezervi ləğv etdi",
        en: "declined reservation",
        ru: "отклоненил бронирование"
    },
    verification_failed_title: {
        az: "Verifikasiya failed",
        en: "Verification failed",
        ru: "Верификация провалена"
    },
    message_send_error_conversation_not_found: {
        az: 'Artıq mesaj yollamaq mümkün deyil.Gediş ya bitib ya da ləğv edilib',
        ru: 'Отправить сообщение больше невозможно. Поездка завершена или отменена.',
        en: 'It is no longer possible to send a message. The ride is either over or canceled'
    },
    verification_failed_body: {
        az: "Verifikasiya failed try again later",
        en: "Verifikasiya failed try again later",
        ru: "Verifikasiya failed позже"
    },
    ride_started: {
        az: "Gediş başlandı",
        en: "Ride has been started",
        ru: "Поездка началась"
    },

    delete_ride: {
        az: "Sürücü gedişi ləğv etdi",
        ru: "Водитель удалил поездку",
        en: "Driver canceled the ride"
    },
    invalid_date: {
        az: 'Seçilmiş tarix və ya vaxt səhvdir',
        ru: 'Выбрана неверная дата или время',
        en: 'Invalid date or time'
    },
    phone_already_exists: {
        az: "Bu nömrə artıq qeydiyyatdan keçib",
        ru: "Пользователь с таким номером уже существует",
        en: "This phone is already exist"
    },
    invalid_data: {
        az: "Məlumat yanlışdır",
        ru: "Информация неверна",
        en: "Invalid data"
    },
    invalid_phone_number: {
        az: "Nömrə yanlışdır",
        ru: "Неправильный номер",
        en: "Invalid phone number"
    },
    login_error: {
        az: "Nomre və ya şifrə səhvdir",
        ru: "Неправильный логин или пароль",
        en: "Invalid phone number or password"
    },
    ride_started_error: {
        az: "Əməliyyat icra oluna bilmir. Gediş artıq başlanıb",
        ru: "Невозможно выполнить операцию. Поездка уже началась",
        en: "Unable to perform operation. Ride has already begun"
    },
    ride_finished: {
        az: "Gedis bitdi",
        ru: "Поездка завершилась",
        en: "Ride has ended"
    },
    user_not_exists: {
        az: "İstifadəçi tapılmadı",
        ru: "Пользователь не существует",
        en: "User is not exist"
    },

    rating_error: {
        az: "Sürücü öz reytingini dəyişə bilməz",
        ru: "Водитель не может изменить свой рейтинг",
        en: "Driver can't change his rating"
    },

    ride_not_exist_error: {
        az: "Gediş tapılmadı",
        ru: "Поездка не найдена",
        en: "Ride not exists"
    },
    wrong_otp_error: {
        az: "Sizin birdəfəlik şifrəniz (OTP) yanlışdır",
        ru: "Ваш одноразовый код (OTP) неверен",
        en: "Your one-time password (OTP) is incorrect"
    },
    expired_otp_error: {
        az: "Sizin birdəfəlik şifrənizin (OTP) müddəti bitmişdir",
        ru: "Ваш одноразовый код (OTP) устарел",
        en: "Your one-time password (OTP) has expired"
    },
    max_ride_count: {
        az: "Gediş sayı 2-dən çox ola bilməz",
        en: "The number of rides can not be more than 2",
        ru: "Количество поездок не может быть больше двух"
    },
    have_ride_as_driver_error: {
        "az": "Siz artıq başqa bir gedişin sürücüsüsiniz",
        "en": "You are already the driver of another ride.",
        "ru": "Вы уже являетесь водителем другой поездки.",
    },
    have_ride_as_passenger_error: {
        "az": "Siz artıq başqa bir gedişin sərnişinisiniz",
        "en": "You are already the passenger of another ride.",
        "ru": "Вы уже являетесь пассажиром другой поездки.",
    },
    max_debt_text: {
        'az': `(-${MAX_DEBT} manat) limitini keçdikdən sonra gediş yarada bilməzsiniz.`,
        'ru': `Вы не можете создать поездку после превышения лимита (-${MAX_DEBT} AZN).`,
        'en': `You cannot create a ride after exceeding the limit of (-${MAX_DEBT} AZN).`
    },
    max_debt_limit: {
        "az": "Borc limiti aşılıb. Xahiş olunur, borcunuzu ödəyin",
        "en": "Exceeded credit limit. Please pay the debt.",
        "ru": "Превышен лимит по задолжности. Пожалуйста, оплатите долг.",
    },
    all_seats_busy_error: {
        az: "Bütün yerlər tutulub",
        ru: "Все места заняты",
        en: "All places are occupied"
    },
    new_message: {
        az: "Sizin yeni mesajınız var",
        ru: "У вас новое сообщение",
        en: "You have a new message"
    },
    user_is_blocked: {
        az: "Hesabınız müvəqqəti olaraq bloklanıb. Müştəri dəstəyi ilə əlaqə saxlayın",
        ru: "Ваш аккаунт временно заблокирован. Обратитесь в центр поддержки",
        en: "Your account is temporarily blocked. Contact support center"
    },
    delete_passenger_from_ride: {
        az: "Sizin rezerviniz ləğv oldu",
        ru: "Ваше резервация была отменена",
        en: "Your reservation has been cancelled"
    },
    have_debt_error:{
        az: "Mənfi balansı olan profili silmək mümkün deyil.",
        ru: "Невозможно удалить профиль при отрицательном балансе.",
        en: "It is impossible to delete a profile with a negative balance."
    },
    password_match_error:{
        az:"Yeni şifrəniz cari şifrənizdən fərqli olmalıdır",
        en:"Your new password must be different from your current password",
        ru:"Ваш новый пароль должен отличаться от вашего текущего пароля"
    },
    password_not_match_error: {
        az: "Şifrə səhvdir",
        ru: "Неправильный пароль",
        en: "Invalid password"
    },
});
