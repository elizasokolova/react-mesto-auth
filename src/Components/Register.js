import React from "react";
import { Link } from "react-router-dom";

export default function Register({onRegister}) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const onEmailChange = (event) => setEmail(event.target.value);
    const onPasswordChange = (event) => setPassword(event.target.value);

    function handleSubmit(event) {
        event.preventDefault();
        onRegister(email, password);
    }

    return (
        <div className="popup__container popup__container_authorization">
            <h2 className="popup__edit popup__edit_authorization">Регистрация</h2>
            <form className="popup__form popup__form_authorization" onSubmit={handleSubmit}>
                <input
                    value={email}
                    onChange={onEmailChange}
                    className="popup__edit-area popup__edit-area_authorization"
                    required
                    name="email"
                    type="email"
                    autoComplete="off"
                    placeholder="Email"
                />
                <input
                    value={password}
                    onChange={onPasswordChange}
                    className="popup__edit-area popup__edit-area_authorization"
                    required
                    name="password"
                    type="password"
                    autoComplete="off"
                    placeholder="Пароль"
                />
                <button className="popup__save-button popup__save-button_authorization" type="submit">Зарегистрироваться</button>
                <Link to="/signin" className="popup__link">Уже зарегистрированы? Войти</Link>
            </form>
        </div>
    );
}