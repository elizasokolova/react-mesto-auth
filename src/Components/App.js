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
import {CurrentUserContext} from "../Contexts/CurrentUserContext";

export default function App() {
    const [isEditPopupOpened, setIsEditPopupOpened] = React.useState(false);
    const [isAddCardPopupOpened, setIsAddCardPopupOpened] = React.useState(false);
    const [isChangeAvatarPopupOpened, setIsChangeAvatarPopupOpened] = React.useState(false);
    const [isDeleteCardPopupOpened, setIsDeleteCardPopupOpened] = React.useState(false);
    const [selectedCard, setSelectedCard] = React.useState(null);
    const [cardToDelete, setCardToDelete]= React.useState(null);

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
        api.getInitialCards()
            .then(setCards)
            .catch(err => console.error(`Error: ${err}`));
    }, []);

    useEffect(() => {
       api.getCurrentUser()
           .then((user) => {
               setCurrentUser(user);
           })
           .catch(err => console.error(`Error: ${err}`));
    }, []);

    const closeAllPopups = () => {
        setIsEditPopupOpened(false);
        setIsAddCardPopupOpened(false);
        setIsChangeAvatarPopupOpened(false);
        setSelectedCard(null);
        setIsDeleteCardPopupOpened(false)
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

    const handleEditAvatarClick = () => setIsChangeAvatarPopupOpened(true);
    const handleEditProfileClick = () => setIsEditPopupOpened(true);
    const handleAddPlaceClick = () => setIsAddCardPopupOpened(true);
    const handleCardClick = (card) => setSelectedCard(card);
    const handleDeleteCardClick = (card) => {setCardToDelete(card); setIsDeleteCardPopupOpened(true)};

    return (
        <>
        <CurrentUserContext.Provider value={currentUser}>
            <Header/>
            <Main
                cards={cards}
                onCardLike={handleCardLike}
                onCardDelete={handleCardDelete}
                onEditAvatar={handleEditAvatarClick}
                onEditButton={handleEditProfileClick}
                onAddButton={handleAddPlaceClick}
                onCardClick={handleCardClick}
                onCardDeleteConfirm={handleDeleteCardClick}
            />
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
        </CurrentUserContext.Provider>
        </>
    )
}