import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Footer({}) {
    return (
        <footer className={styles.footer}>
            <a href="#">
                All rights reserved - ImmoBloc ©
            </a>
        </footer>
    )
}