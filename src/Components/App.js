import '../App.css';
import React, {useEffect} from 'react';
import Header from './Header';
import Footer from './Footer';
import Main from './Main';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import DeleteCardPopup from "./DeleteCardPopup";
import AddPlacePopup from "./AddPlacePopup";
import ImagePopup from "./ImagePopup";
import api from "../Utils/Api";
import auth from "../Utils/Auth";
import {CurrentUserContext} from "../Contexts/CurrentUserContext";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";
import Login from "./Login";
import InfoToolTip from "./InfoToolTip";

export default function App() {
    const [isEditPopupOpened, setIsEditPopupOpened] = React.useState(false);
    const [isAddCardPopupOpened, setIsAddCardPopupOpened] = React.useState(false);
    const [isChangeAvatarPopupOpened, setIsChangeAvatarPopupOpened] = React.useState(false);
    const [isDeleteCardPopupOpened, setIsDeleteCardPopupOpened] = React.useState(false);
    const [isInfoToolTipPopupOpen, setInfoToolTipPopupOpen] = React.useState(false);
    const [selectedCard, setSelectedCard] = React.useState(null);
    const [cardToDelete, setCardToDelete]= React.useState(null);
    const [isRegistered, setIsRegistered] = React.useState(false);
    const [isLogin, setIsLogin] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const history = useHistory();

    const [currentUser, setCurrentUser] = React.useState({
        name: '',
        about: ''
    });
    const [cards, setCards] = React.useState([]);

    function handleCardLike(card) {
        // Снова проверяем, есть ли уже лайк на этой карточке
        const isLiked = card.likes.some(user => user._id === currentUser._id);
        // Отправляем запрос в API и получаем обновлённые данные карточки
        api.changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => setCards((oldCards) =>
                oldCards.map((oldCard) => oldCard._id === newCard._id ? newCard : oldCard)
            ))
            .catch(err => console.error(`Error: ${err}`));
    }

    function handleCardDelete(card) {
        api.deleteCard(cardToDelete._id)
            .then(() => {
                setCards((oldCards) => oldCards.filter((oldCard) => oldCard._id !== cardToDelete._id))
                closeAllPopups();
            })
            .catch(err => console.error(`Error: ${err}`));
    }

    useEffect(() => {
        if (isLogin) {
            Promise.all([api.getCurrentUser(), api.getInitialCards()])
                .then(([userInfo, cardInfo]) => {
                    setCurrentUser(userInfo);
                    setCards(cardInfo);
                })
                .catch((err) => console.log(err))
        }
    }, [isLogin]);

    // useEffect(() => {
    //     api.getInitialCards()
    //         .then(setCards)
    //         .catch(err => console.error(`Error: ${err}`));
    // }, []);
    //
    // useEffect(() => {
    //    api.getCurrentUser()
    //        .then((user) => {
    //            setCurrentUser(user);
    //        })
    //        .catch(err => console.error(`Error: ${err}`));
    // }, []);

    useEffect(() => {
        function handleOverlayEscClose(event) {
            if (event.target.classList.contains("popup_opened") || (event.key === 'Escape')) {
                closeAllPopups();
            }
        }
        document.addEventListener("click", handleOverlayEscClose);
        document.addEventListener("keydown", handleOverlayEscClose);
    });

    const closeAllPopups = () => {
        setIsEditPopupOpened(false);
        setIsAddCardPopupOpened(false);
        setIsChangeAvatarPopupOpened(false);
        setIsDeleteCardPopupOpened(false)
        setInfoToolTipPopupOpen(false);
        setSelectedCard(null);
    };

    function handleUpdateUser (userData) {
        api.updateCurrentUser(userData)
            .then(newUserData => {
                setCurrentUser(newUserData);
                closeAllPopups();
            })
            .catch((err => console.error(`Error: ${err}`)))
    }

    function handleUpdateAvatar (userData) {
        api.changeAvatar(userData)
            .then(newUserData => {
                setCurrentUser(newUserData);
                closeAllPopups();
            })
            .catch((err => console.error(`Error: ${err}`)))
    }

    function handleAddPlaceSubmit (userData) {
        api.addNewCard(userData)
            .then(newCard => {
                setCards([newCard, ...cards]);
                closeAllPopups();
            })
            .catch((err => console.error(`Error: ${err}`)))
    }

    //Хук для проверки токена при каждом монтировании компонента App
    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        //проверим существует ли токен в хранилище браузера localStorage
        if (jwt) {
            auth
                .checkTokenValidity(jwt)
                .then((res) => {
                    setIsLogin(true);
                    setEmail(res.data.email);
                    history.push("/");
                })
                .catch((err) => {
                    if (err.status === 401) {
                        console.log("401 — Токен не передан или передан не в том формате");
                    }
                    console.log("401 — Переданный токен некорректен");
                });
        }
    }, [history]);

    function handleLogIn(email, password) {
        auth
            .login(email, password)
            .then((res) => {
                localStorage.setItem("jwt", res.token);
                setIsLogin(true);
                setEmail(email);
                history.push("/");
            })
            .catch((err) => {
                if (err.status === 400) {
                    console.log("400: не передано одно из полей");
                } else if (err.status === 401) {
                    console.log("401: пользователь с email не найден");
                }
                setInfoToolTipPopupOpen(true);
                setIsRegistered(false);
            });
    }

    function handleRegistration(email, password) {
        auth
            .register(email, password)
            .then((res) => {
                setInfoToolTipPopupOpen(true);
                setIsRegistered(true);
                history.push("/sign-in");
            })
            .catch((err) => {
                if (err.status === 400) {
                    console.log("400: некорректно заполнено одно из полей");
                }
                setInfoToolTipPopupOpen(true);
                setIsRegistered(false);
            });
    }

    function handleLogOut() {
        localStorage.removeItem("jwt");
        setIsLogin(false);
        history.push("/signin");
    }

    const handleEditAvatarClick = () => setIsChangeAvatarPopupOpened(true);
    const handleEditProfileClick = () => setIsEditPopupOpened(true);
    const handleAddPlaceClick = () => setIsAddCardPopupOpened(true);
    const handleCardClick = (card) => setSelectedCard(card);
    const handleDeleteCardClick = (card) => {setCardToDelete(card); setIsDeleteCardPopupOpened(true)};

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <>
            <Header email={email} logOut={handleLogOut} />
            <Switch>
                <ProtectedRoute
                    exact
                    path="/"
                    isLogin={isLogin}
                    component={Main}
                    cards={cards}
                    onCardLike={handleCardLike}
                    onCardDelete={handleCardDelete}
                    onEditAvatar={handleEditAvatarClick}
                    onEditButton={handleEditProfileClick}
                    onAddButton={handleAddPlaceClick}
                    onCardClick={handleCardClick}
                    onCardDeleteConfirm={handleDeleteCardClick}
                />
                <Route path="/signin">
                    <Login onLogin={handleLogIn} />
                </Route>
                <Route path="/signup">
                    <Register onRegister={handleRegistration} />
                </Route>
                <Route>
                    {isLogin ? <Redirect to="/" /> : <Redirect to="/signin" />}
                </Route>
            </Switch>

            <Footer/>

            {/* Попап Редактировать профиль */}
            <EditProfilePopup
                isOpen={isEditPopupOpened}
                onClose={closeAllPopups}
                onUserUpdate={handleUpdateUser}/>

            {/* Попап Добавить новую карточку */}
            <AddPlacePopup
                isOpen={isAddCardPopupOpened}
                onClose={closeAllPopups}
                onAddPlace={handleAddPlaceSubmit} />

            {/* Попап Обновить аватарку */}
            <EditAvatarPopup
                onUpdateAvatar={handleUpdateAvatar}
                isOpen={isChangeAvatarPopupOpened}
                onClose={closeAllPopups} />

            {/* Попап удаления карточки */}
            <DeleteCardPopup
                isOpen={isDeleteCardPopupOpened}
                onClose={closeAllPopups}
                onCardDelete={handleCardDelete}
                card={cardToDelete} />

            {/* Попап открытия полноразмерной карточки */}
            <ImagePopup
                isOpen={selectedCard !== null}
                card={selectedCard}
                onClose={closeAllPopups} />

            <InfoToolTip
                isOpen={isInfoToolTipPopupOpen}
                onClose={closeAllPopups}
                isRegistered={isRegistered}
            />
            </>
        </CurrentUserContext.Provider>
    )
}