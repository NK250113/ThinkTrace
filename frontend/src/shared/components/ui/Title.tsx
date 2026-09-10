export function AppLogo({h}: {h: string}) {
    return (
        <img src="public/logo.svg" className={`h-${h}`}>ThinkTrace</img>
    );
}