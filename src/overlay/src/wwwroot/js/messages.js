﻿"use strict";

const socket = io('http://localhost:5060');

socket.on('newCheer', (newCheerEventArg) => {
    const cheerer = newCheerEventArg.cheerer;
    const displayName = cheerer.user.display_name || cheerer.user.login;
    const msg = `${displayName} just cheered ${cheerer.bits} bits`;
    addAndStart(msg, 'applause', cheerer.user.profile_image_url, 10);
});

socket.on('newRaid', (newRaidEventArg) => {
    const raider = newRaidEventArg.raider;
    const displayName = raider.user.display_name || raider.user.login;
    const msg = `DEFEND! ${displayName} is raiding with ${raider.viewers} accomplices!`;
    addAndStart(msg, 'goodbadugly', raider.user.profile_image_url, 10);
});

socket.on('newSubscription', (newSubscriptionEventArg) => {
    const subscriber = newSubscriptionEventArg.subscriber;
    const displayName = subscriber.user.display_name || subscriber.user.login;
    const cumulativeMonths = subscriber.cumulativeMonths;
    let msg = '';
    if (cumulativeMonths > 1) {
        msg = `${displayName}'s been in the club for ${cumulativeMonths} months! How's that hairline?`;
    }
    else {
        msg = `Welcome to the club ${displayName}!`;
    }
    addAndStart(msg, 'hair', subscriber.user.profile_image_url, 10);
});

socket.on('newFollow', (newFollowerEventArg) => {
    const follower = newFollowerEventArg.follower;
    const displayName = follower.display_name || follower.login;
    const msg = `Welcome ${displayName}! Thanks for following!`;
    attemptToStart(msg, 'ohmy', follower.profile_image_url, 10);
});

let messageQueue = [];

const intro = 'fadeInDown';
const outro = 'fadeOutDown';
let isActive = false;

const messageObj = document.getElementById('message');
const messageBody = document.getElementById('displayName');
const profileImg = document.getElementById('profileImageUrl');

function addAndStart(m, a, p, t) {
    messageQueue.push({message: m, audio: a, profileImageUrl: p, timeout: t});
    if (isActive == false) {
        processMessage(messageQueue[0], false);
    }
}

function processMessage(qItem, bypass) {

    if (isActive == true &&
        bypass == false) {
        return;
    }

    isActive = true;

    messageObj.classList.remove(outro);

    messageBody.innerHTML = qItem.message;
    profileImg.src = qItem.profileImageUrl;

    messageObj.classList.add(intro);

    // Emit playAudio if needed
    if(qItem.audio && qItem.audio.length > 0) {
        socket.emit('playAudio', qItem.audio);
    }

    messageQueue.splice(0, 1);

    setTimeout(() => {
        messageObj.classList.remove(intro);
        messageObj.classList.add(outro);

        setTimeout(() => {
            profileImg.src = '';
            messageBody.innerHTML = '';

            if (messageQueue.length > 0) {
                processMessage(messageQueue[0], true);
            }
            else {
                isActive = false;
            }
        }, 2000);
    }, qItem.timeout * 1000);
}
