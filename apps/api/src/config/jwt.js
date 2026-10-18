const EXPIRES_IN = '1d'

export default function jwtOptions() {
    return {
        secret: process.env.CLIENT_SECRET,
        signOptions: { expiresIn: EXPIRES_IN },
    }
}
