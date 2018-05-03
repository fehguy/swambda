"use strict";

const cache = {};

const findAll = exports.findAll = (args) => {
  return new Promise((resolve, reject) => {
    let keys = Object.keys(cache);
    if(typeof args.limit !== "undefined") {
      keys = keys.slice(0, args.limit);
    }
    const pets = keys.map((key) => {
      return cache[key];
    })
    respondWith(resolve, 200, pets);
  })
}

const createPet = exports.createPet = (args) => {
  return new Promise((resolve, reject) => {
    const pet = args.pet;
    if(typeof pet.id === "undefined") {
      pet.id = "pet-" + new Date().getTime();
    }
    cache[pet.id] = pet;
    respondWith(resolve, 201);
  })
}

const getPetById = exports.getPetById = (args) => {
  return new Promise((resolve, reject) => {
    const petId = args.petId;
    if(typeof petId === "undefined") {
      respondWith(resolve, 400, {
        code: 400,
        message: "invalid pet id"
      });
      return;
    }
    if(cache[petId]) {
      respondWith(resolve, 200, cache[petId]);
    }
    respondWith(resolve, 404, {
      code: 404,
      message: "pet not found"
    });
  })
}
