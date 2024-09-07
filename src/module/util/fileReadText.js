// Read the text file
export default function frText(file) {
    return new Promise((r => {
        let fr = new FileReader();
        fr.readAsText(file);
        fr.onload = () => r(fr.result);
    }));
}