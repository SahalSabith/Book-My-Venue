package main

type contextKey string

const userContextKey = contextKey("userID")
const roleContextKey = contextKey("role")