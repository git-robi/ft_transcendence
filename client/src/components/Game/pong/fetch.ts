export async function GetJSONdata(url: string): Promise<unknown> {
    try {
        let result = await fetch(url);
        let data = await result.json();
        return (data);
    }
    catch {
        return (null);
    }
}
