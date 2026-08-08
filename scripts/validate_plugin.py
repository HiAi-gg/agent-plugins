#!/usr/bin/env python3
"""Independent validation of Agent Plugins against official 1.0.0 schemas and
the Agent Skills specification. Uses only official schemas fetched from
agent-plugins.org. This is separate from the Builder's own validation."""
import json, sys, re, pathlib, urllib.request

PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json"
import jsonschema

_cache = {}

def load_schema(url):
    if url not in _cache:
        with urllib.request.urlopen(url) as r:
            _cache[url] = json.load(r)
    return _cache[url]

def validate_plugin_json(path):
    doc = json.loads(path.read_text())
    jsonschema.validate(doc, load_schema(PLUGIN_SCHEMA))
    assert doc["$schema"] == PLUGIN_SCHEMA
    return doc

def validate_mcp_json(path, plugin_schema_url):
    doc = json.loads(path.read_text())
    jsonschema.validate(doc, load_schema(MCP_SCHEMA))
    # spec 10.1: mcp.json $schema must target the same spec version as plugin.json.
    # Both are canonical 1.0.0 identifiers; they differ only by schema name.
    assert doc["$schema"] == MCP_SCHEMA, f"bad mcp.json $schema {doc['$schema']!r}"
    assert plugin_schema_url == PLUGIN_SCHEMA, f"unexpected plugin $schema {plugin_schema_url!r}"
    return doc

NAME_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$")

def validate_skill(skill_dir):
    md = skill_dir / "SKILL.md"
    text = md.read_text()
    assert text.startswith("---\n"), f"{md}: missing YAML frontmatter"
    # crude frontmatter split
    parts = text.split("---\n", 2)
    assert len(parts) >= 3, f"{md}: malformed frontmatter"
    fm = parts[1]
    # parse simple scalar lines
    fields = {}
    for line in fm.splitlines():
        if ":" in line and not line.startswith(" "):
            k, v = line.split(":", 1)
            fields[k.strip()] = v.strip()
    assert "name" in fields, f"{md}: missing name"
    assert "description" in fields, f"{md}: missing description"
    name = fields["name"].strip('"').strip("'")
    assert len(name) <= 64, f"{md}: name too long"
    assert NAME_RE.match(name), f"{md}: invalid skill name {name!r}"
    assert name == skill_dir.name, f"{md}: name {name!r} != dir {skill_dir.name!r}"
    desc = fields["description"].strip('"').strip("'")
    assert 1 <= len(desc) <= 1024, f"{md}: bad description length"
    for opt in ("license", "compatibility", "allowed-tools"):
        if opt in fields:
            assert len(fields[opt]) <= 500, f"{md}: {opt} too long"
    # body must be non-empty
    body = parts[2]
    assert body.strip(), f"{md}: empty body"
    return name

def main(root):
    root = pathlib.Path(root)
    plugin = validate_plugin_json(root / "plugin.json")
    print(f"  plugin.json: OK (name={plugin['name']})")
    mcp_path = root / "mcp.json"
    if mcp_path.exists():
        mcp = validate_mcp_json(mcp_path, plugin["$schema"])
        for name, srv in mcp["mcpServers"].items():
            print(f"  mcp.json: OK server={name} type={srv['type']}")
    else:
        print("  mcp.json: absent (OK)")
    skills_dir = root / "skills"
    if skills_dir.exists():
        count = 0
        for d in sorted(skills_dir.iterdir()):
            if d.is_dir() and (d / "SKILL.md").exists():
                n = validate_skill(d)
                print(f"  skill {n}: OK")
                count += 1
        print(f"  skills: {count} validated")
    else:
        print("  skills: absent (OK)")
    print("  INDEPENDENT VALIDATION: PASS")

if __name__ == "__main__":
    main(sys.argv[1])
