export default function AppLogoIcon({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/image/logo.jpg"
            alt="SchoolDay Logo"
            className={className}
            {...props}
        />
    );
}
