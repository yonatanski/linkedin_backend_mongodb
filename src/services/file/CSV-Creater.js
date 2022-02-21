import express from "express";
import fs from 'fs-extra'
import {join, dirname, extname} from 'path'
import { fileURLToPath } from "url";


const {readJSON, writeJSON, writeFile, createReadStream} = fs

export const getExperiencesReadableStream = () => createReadStream()